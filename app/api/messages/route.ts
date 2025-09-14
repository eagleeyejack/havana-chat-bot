import { NextRequest, NextResponse } from "next/server";
import {
	createMessage,
	getMessages,
	getMessagesByChat,
} from "@/lib/db/actions/actions.messages";
import { updateChat, getChatById } from "@/lib/db/actions/actions.chats";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/lib/db/schema";

// GET /api/messages - Get messages
export async function GET(request: NextRequest) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId");
		const role = searchParams.get("role") as "student" | "bot" | "admin" | null;
		const count = searchParams.get("count");

		console.log(`🔍 [GET /api/messages] Request params:`, {
			chatId: chatId ? `${chatId.substring(0, 8)}...` : null,
			role,
			count,
			timestamp: new Date().toISOString(),
		});

		let messages;
		if (chatId) {
			// Get messages for a specific chat
			messages = await getMessagesByChat(chatId, count ? parseInt(count) : 50);
		} else {
			// Get messages with filters
			const options: { count?: number; role?: Message["role"] } = {};
			if (role) options.role = role;
			if (count) options.count = parseInt(count);

			messages = await getMessages(options);
		}

		const duration = Date.now() - startTime;
		console.log(`✅ [GET /api/messages] Success:`, {
			resultCount: messages.length,
			chatId: chatId ? `${chatId.substring(0, 8)}...` : "all",
			duration: `${duration}ms`,
		});

		return NextResponse.json(messages);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [GET /api/messages] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
	const startTime = Date.now();
	try {
		const body = await request.json();
		const { chatId, role, content, meta } = body;

		console.log(`🔍 [POST /api/messages] Request:`, {
			chatId: chatId ? `${chatId.substring(0, 8)}...` : null,
			role,
			contentLength: content?.length || 0,
			hasMeta: !!meta,
			timestamp: new Date().toISOString(),
		});

		if (!chatId || !role || !content) {
			return NextResponse.json(
				{ error: "chatId, role, and content are required" },
				{ status: 400 }
			);
		}

		if (!["student", "bot", "admin"].includes(role)) {
			return NextResponse.json(
				{ error: "Invalid role. Must be 'student', 'bot', or 'admin'" },
				{ status: 400 }
			);
		}

		const messageId = uuidv4();
		const newMessage = await createMessage({
			id: messageId,
			chatId,
			role,
			content,
			meta,
		});

		// Update the chat's lastMessageAt timestamp
		await updateChat(chatId, {
			lastMessageAt: new Date(),
		});

		// Trigger AI response for student messages (asynchronously, don't block response)
		if (role === "student") {
			// Don't await this - let it run in background
			triggerAIResponse(chatId, content).catch((error) => {
				console.error(
					`Failed to trigger AI response for chat ${chatId}:`,
					error
				);
			});
		}

		const duration = Date.now() - startTime;
		console.log(`✅ [POST /api/messages] Success:`, {
			messageId: newMessage.id,
			chatId: `${chatId.substring(0, 8)}...`,
			role,
			duration: `${duration}ms`,
		});

		return NextResponse.json(newMessage);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [POST /api/messages] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to create message" },
			{ status: 500 }
		);
	}
}

/**
 * Asynchronously trigger AI response for student messages
 * This runs in the background and doesn't block the message creation response
 */
async function triggerAIResponse(
	chatId: string,
	userMessage: string
): Promise<void> {
	try {
		console.log(
			`🤖 [AI Trigger] Starting AI response for chat ${chatId.substring(
				0,
				8
			)}...`
		);

		// Get chat details to check if AI should respond
		const chat = await getChatById(chatId);
		if (!chat) {
			console.log(`🤖 [AI Trigger] Chat not found: ${chatId}`);
			return;
		}

		// Don't trigger AI if admin has taken over
		if (chat.adminTakenOver) {
			console.log(
				`🤖 [AI Trigger] Skipping - admin has taken over chat ${chatId.substring(
					0,
					8
				)}...`
			);
			return;
		}

		// Get recent conversation history for AI context
		const messages = await getMessagesByChat(chatId, 20); // Get last 20 messages for context
		const conversationHistory = messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
		}));

		// Check if this is the first student message for title generation
		const studentMessages = conversationHistory.filter(
			(msg) => msg.role === "student"
		);
		const isFirstStudentMessage = studentMessages.length === 1;

		console.log(
			`🤖 [AI Trigger] Generating AI response for chat ${chatId.substring(
				0,
				8
			)}... (${
				conversationHistory.length
			} messages in history, first student message: ${isFirstStudentMessage})`
		);

		// Generate chat title if this is the first student message
		if (isFirstStudentMessage) {
			try {
				console.log(
					`📝 [Title Generation] Generating title for chat ${chatId.substring(
						0,
						8
					)}... based on: "${userMessage.substring(0, 50)}${
						userMessage.length > 50 ? "..." : ""
					}"`
				);

				const { generateChatTitle } = await import("@/lib/utils/ai-response");
				const newTitle = await generateChatTitle(userMessage);

				// Update the chat with the new AI-generated title
				await updateChat(chatId, {
					title: newTitle,
				});

				console.log(
					`✅ [Title Generation] Title generated and updated for chat ${chatId.substring(
						0,
						8
					)}...: "${newTitle}"`
				);
			} catch (titleError) {
				console.error(
					`❌ [Title Generation] Failed to generate title for chat ${chatId}:`,
					titleError
				);
				// Continue with AI response even if title generation fails
			}
		}

		// Use the AI utility directly instead of making HTTP calls
		const { generateAIResponse } = await import("@/lib/utils/ai-response");

		const result = await generateAIResponse({
			chatId,
			userMessage,
			conversationHistory,
		});

		console.log(
			`✅ [AI Trigger] AI response generated successfully for chat ${chatId.substring(
				0,
				8
			)}... (${
				result.analysis.escalationSuggested
					? "escalation suggested"
					: "normal response"
			})`
		);
	} catch (error) {
		console.error(
			`❌ [AI Trigger] Failed to generate AI response for chat ${chatId}:`,
			error
		);
		// Don't throw - we want this to fail silently to avoid breaking the main message flow
	}
}
