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
	try {
		const { searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId");
		const role = searchParams.get("role") as "student" | "bot" | "admin" | null;
		const count = searchParams.get("count");

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

		return NextResponse.json(messages);
	} catch (error) {
		console.error("Error in GET /api/messages:", error);
		return NextResponse.json(
			{ error: "Failed to fetch messages" },
			{ status: 500 }
		);
	}
}

// POST /api/messages - Create a new message
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { chatId, role, content, meta } = body;

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

		return NextResponse.json(newMessage);
	} catch (error) {
		console.error("Error in POST /api/messages:", error);
		return NextResponse.json(
			{ error: "Failed to create message" },
			{ status: 500 }
		);
	}
}
