import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

import { createMessage } from "@/lib/db/actions/actions.messages";
import { createAuditLog } from "@/lib/db/actions/actions.audit_llm";
import { v4 as uuidv4 } from "uuid";
import {
	analyzeConversation,
	generateSystemPrompt,
	searchKnowledgeBase,
} from "@/lib/open-ai/prompts";

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
	try {
		const body: AIRequest = await request.json();
		const { chatId, userMessage, conversationHistory = [] } = body;

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

		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages,
			max_tokens: 500,
			temperature: 0.7,
		});

		const aiResponse = completion.choices[0]?.message?.content;

		if (!aiResponse) {
			throw new Error("No response from OpenAI");
		}

		/*
			Do we need to escalate this or book a call?
		*/
		const analysis = analyzeConversation(userMessage, conversationHistory);

		const meta = JSON.stringify({
			sources: relevantKB.map((entry) => entry.id),
			escalationSuggested: analysis.escalationSuggested,
			bookingSuggested: analysis.bookingSuggested,
			model: "gpt-4o-mini",
		});

		const messageId = uuidv4();
		await createMessage({
			id: messageId,
			chatId,
			role: "bot",
			content: aiResponse,
			meta,
		});

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

		return NextResponse.json({
			success: true,
			message: {
				id: messageId,
				role: "bot",
				content: aiResponse,
				meta,
			},
			sources: relevantKB,
			analysis,
		});
	} catch (error) {
		console.error("Error in AI chat API:", error);
		return NextResponse.json(
			{ error: "Failed to generate AI response" },
			{ status: 500 }
		);
	}
}
