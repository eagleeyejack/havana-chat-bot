import { NextRequest, NextResponse } from "next/server";
import {
	createMessage,
	getMessages,
	getMessagesByChat,
} from "@/lib/db/actions/actions.messages";
import { updateChat } from "@/lib/db/actions/actions.chats";
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
