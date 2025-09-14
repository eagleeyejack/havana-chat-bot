import { NextRequest, NextResponse } from "next/server";
import { updateChat } from "@/lib/db/actions/actions.chats";
import { generateAIResponse } from "@/lib/utils/ai-response";

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

		// Use the utility function for AI generation
		const result = await generateAIResponse({
			chatId,
			userMessage,
			conversationHistory,
		});

		// Update chat's lastMessageAt timestamp
		try {
			await updateChat(chatId, {
				lastMessageAt: new Date(),
			});
		} catch (updateError) {
			console.error("Failed to update chat timestamp:", updateError);
		}

		const duration = Date.now() - startTime;
		console.log(`✅ [POST /api/ai/chat] Success:`, {
			messageId: result.message.id,
			chatId: `${chatId.substring(0, 8)}...`,
			responseLength: result.message.content.length,
			sourcesCount: result.sources.length,
			escalationSuggested: result.analysis.escalationSuggested,
			bookingSuggested: result.analysis.bookingSuggested,
			aiEscalationNeeded:
				result.analysis.escalationAnalysis?.escalationNeeded || false,
			duration: `${duration}ms`,
		});

		return NextResponse.json(result);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [POST /api/ai/chat] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to generate AI response" },
			{ status: 500 }
		);
	}
}
