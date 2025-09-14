import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { createMessage } from "@/lib/db/actions/actions.messages";
import { createAuditLog } from "@/lib/db/actions/actions.audit_llm";
import { v4 as uuidv4 } from "uuid";
import {
	analyzeConversation,
	generateSystemPrompt,
	searchKnowledgeBase,
	generateEscalationAnalysisPrompt,
} from "@/lib/open-ai/prompts";
import { updateChat } from "@/lib/db/actions";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface AIRequest {
	chatId: string;
	userMessage: string;
	conversationHistory: Array<{
		role: "student" | "bot" | "admin";
		content: string;
	}>;
}

export async function POST(request: NextRequest) {
	const startTime = Date.now();
	try {
		const body: AIRequest = await request.json();
		const { chatId, userMessage, conversationHistory = [] } = body;

		console.log(`🔍 [POST /api/ai/chat] Request:`, {
			chatId: chatId ? `${chatId.substring(0, 8)}...` : null,
			messageLength: userMessage?.length || 0,
			historyLength: conversationHistory.length,
			timestamp: new Date().toISOString(),
		});

		if (!chatId || !userMessage) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		if (!process.env.OPENAI_API_KEY) {
			return NextResponse.json(
				{ error: "OpenAI API key not configured" },
				{ status: 500 }
			);
		}

		/* 
			Search knowledge base for relevant information
		*/
		const relevantKB = searchKnowledgeBase(userMessage);

		/* 
			Prompt for the LLM that contains the knowledge base 
		*/
		const systemPrompt = generateSystemPrompt(relevantKB);

		const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
			{
				role: "system",
				content: systemPrompt,
			},
			// Add recent conversation history (last 10 messages to stay within token limits)
			...conversationHistory.slice(-10).map((msg) => ({
				role:
					msg.role === "student" ? ("user" as const) : ("assistant" as const),
				content: msg.content,
			})),
			{
				role: "user",
				content: userMessage,
			},
		];

		// Run AI response and escalation analysis in parallel for better performance
		const [completion, analysis] = await Promise.all([
			openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages,
				max_tokens: 500,
				temperature: 0.7,
			}),
			// Simple keyword-based analysis (fast)
			Promise.resolve(analyzeConversation(userMessage, conversationHistory)),
		]);

		const aiResponse = completion.choices[0]?.message?.content;

		if (!aiResponse) {
			throw new Error("No response from OpenAI");
		}

		const meta = JSON.stringify({
			sources: relevantKB.map((entry) => entry.id),
			escalationSuggested: analysis.escalationSuggested,
			bookingSuggested: analysis.bookingSuggested,
			model: "gpt-4o-mini",
		});

		const messageId = uuidv4();

		// Run message creation and escalation analysis in parallel to improve performance
		const escalationPrompt = generateEscalationAnalysisPrompt(
			userMessage,
			conversationHistory
		);

		const [, escalationCompletion] = await Promise.all([
			// Create message in DB
			createMessage({
				id: messageId,
				chatId,
				role: "bot",
				content: aiResponse,
				meta,
			}),
			// Get AI escalation analysis in parallel
			openai.chat.completions.create({
				model: "gpt-4o-mini",
				messages: [
					{
						role: "user",
						content: escalationPrompt,
					},
				],
				max_tokens: 300,
				temperature: 0.3,
			}),
		]);

		// Process escalation analysis
		let escalationAnalysis = null;
		try {
			const escalationResponse =
				escalationCompletion.choices[0]?.message?.content;
			if (escalationResponse) {
				try {
					escalationAnalysis = JSON.parse(escalationResponse);

					// Update chat status if escalation is needed with high confidence
					if (
						escalationAnalysis.escalationNeeded &&
						escalationAnalysis.confidence > 0.7
					) {
						await updateChat(chatId, {
							status: "escalated" as const,
							lastMessageAt: new Date(),
						});
					}

					// Create audit log for escalation analysis
					await createAuditLog({
						id: uuidv4(),
						chatId,
						messageId,
						model: "gpt-4o-mini",
						prompt: escalationPrompt,
						context: JSON.stringify({
							userMessage,
							conversationLength: conversationHistory.length,
							escalationAnalysis: "AI-powered analysis",
						}),
						response: escalationResponse,
						usage: JSON.stringify(escalationCompletion.usage),
					});
				} catch (parseError) {
					console.error(
						"Failed to parse escalation analysis:",
						escalationResponse,
						parseError
					);
				}
			}
		} catch (escalationError) {
			console.error("Error in escalation analysis:", escalationError);
			// Continue execution even if escalation analysis fails
		}

		await createAuditLog({
			id: uuidv4(),
			chatId,
			messageId,
			model: "gpt-4o-mini",
			prompt: systemPrompt,
			context: JSON.stringify({
				userMessage,
				relevantKB: relevantKB.map((kb) => kb.id),
			}),
			response: aiResponse,
			usage: JSON.stringify(completion.usage),
		});

		const duration = Date.now() - startTime;
		console.log(`✅ [POST /api/ai/chat] Success:`, {
			messageId,
			chatId: `${chatId.substring(0, 8)}...`,
			responseLength: aiResponse.length,
			sourcesCount: relevantKB.length,
			escalationSuggested: analysis.escalationSuggested,
			bookingSuggested: analysis.bookingSuggested,
			aiEscalationNeeded: escalationAnalysis?.escalationNeeded || false,
			duration: `${duration}ms`,
		});

		return NextResponse.json({
			success: true,
			message: {
				id: messageId,
				role: "bot",
				content: aiResponse,
				meta,
			},
			sources: relevantKB,
			analysis: {
				...analysis,
				// Include AI escalation analysis if available
				aiEscalationAnalysis: escalationAnalysis,
			},
		});
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [POST /api/ai/chat] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to generate AI response" },
			{ status: 500 }
		);
	}
}
