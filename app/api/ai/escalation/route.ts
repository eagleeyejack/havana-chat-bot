import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { generateEscalationAnalysisPrompt } from "@/lib/open-ai/prompts";
import { updateChat } from "@/lib/db/actions/actions.chats";
import { createAuditLog } from "@/lib/db/actions/actions.audit_llm";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

interface EscalationRequest {
	chatId: string;
	messageId: string;
	userMessage: string;
	conversationHistory: Array<{
		role: "student" | "bot" | "admin";
		content: string;
	}>;
}

interface EscalationAnalysis {
	escalationNeeded: boolean;
	confidence: number;
	reasons: string[];
	suggestedResponse: string;
}

/**
 * POST /api/ai/escalation - Analyze conversation for escalation needs using AI
 */
export async function POST(request: NextRequest) {
	try {
		const body: EscalationRequest = await request.json();
		const { chatId, messageId, userMessage, conversationHistory = [] } = body;

		if (!chatId || !messageId || !userMessage) {
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

		// Generate the escalation analysis prompt
		const analysisPrompt = generateEscalationAnalysisPrompt(
			userMessage,
			conversationHistory
		);

		// Get AI analysis
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: analysisPrompt,
				},
			],
			max_tokens: 300,
			temperature: 0.3, // Lower temperature for more consistent analysis
		});

		const aiResponse = completion.choices[0]?.message?.content;

		if (!aiResponse) {
			throw new Error("No response from OpenAI");
		}

		// Parse the JSON response
		let analysis: EscalationAnalysis;
		try {
			analysis = JSON.parse(aiResponse);
		} catch (error) {
			console.error("Failed to parse AI response:", aiResponse, error);
			// Fallback to basic analysis
			analysis = {
				escalationNeeded: false,
				confidence: 0.1,
				reasons: ["AI analysis failed"],
				suggestedResponse: "Continue with regular support",
			};
		}

		// If escalation is needed with high confidence, update chat status
		if (analysis.escalationNeeded && analysis.confidence > 0.7) {
			try {
				await updateChat(chatId, {
					status: "escalated" as const,
					lastMessageAt: new Date(),
				});
			} catch (error) {
				console.error("Failed to update chat status:", error);
				// Continue execution even if status update fails
			}
		}

		// Create audit log
		await createAuditLog({
			id: uuidv4(),
			chatId,
			messageId,
			model: "gpt-4o-mini",
			prompt: analysisPrompt,
			context: JSON.stringify({
				userMessage,
				conversationLength: conversationHistory.length,
			}),
			response: aiResponse,
			usage: JSON.stringify(completion.usage),
		});

		return NextResponse.json({
			success: true,
			analysis: {
				escalationNeeded: analysis.escalationNeeded,
				confidence: analysis.confidence,
				reasons: analysis.reasons,
				suggestedResponse: analysis.suggestedResponse,
				chatStatusUpdated:
					analysis.escalationNeeded && analysis.confidence > 0.7,
			},
		});
	} catch (error) {
		console.error("Error in escalation analysis API:", error);
		return NextResponse.json(
			{ error: "Failed to analyze escalation needs" },
			{ status: 500 }
		);
	}
}
