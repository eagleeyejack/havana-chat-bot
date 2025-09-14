import { NextRequest, NextResponse } from "next/server";
import { getChatById, updateChat } from "@/lib/db/actions/actions.chats";

// GET /api/chats/[chatId] - Get a specific chat by ID
export async function GET(request: NextRequest) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId");

		console.log(`🔍 [GET /api/chats/[chatId]] Request:`, {
			chatId: chatId ? `${chatId.substring(0, 8)}...` : null,
			timestamp: new Date().toISOString(),
		});

		if (!chatId) {
			return NextResponse.json(
				{ error: "Chat ID is required" },
				{ status: 400 }
			);
		}

		const chat = await getChatById(chatId);

		if (!chat) {
			return NextResponse.json({ error: "Chat not found" }, { status: 404 });
		}

		const duration = Date.now() - startTime;
		console.log(`✅ [GET /api/chats/[chatId]] Success:`, {
			chatId: `${chatId.substring(0, 8)}...`,
			status: chat.status,
			duration: `${duration}ms`,
		});

		return NextResponse.json(chat);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(
			`❌ [GET /api/chats/[chatId]] Error after ${duration}ms:`,
			error
		);
		return NextResponse.json(
			{ error: "Failed to fetch chat" },
			{ status: 500 }
		);
	}
}

// PATCH /api/chats/[chatId] - Update a specific chat
export async function PATCH(request: NextRequest) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId");
		const body = await request.json();

		console.log(`🔍 [PATCH /api/chats/[chatId]] Request:`, {
			chatId: chatId ? `${chatId.substring(0, 8)}...` : null,
			updateFields: Object.keys(body),
			timestamp: new Date().toISOString(),
		});

		if (!chatId) {
			return NextResponse.json(
				{ error: "Chat ID is required" },
				{ status: 400 }
			);
		}

		const updatedChat = await updateChat(chatId, body);

		if (!updatedChat) {
			return NextResponse.json(
				{ error: "Chat not found or update failed" },
				{ status: 404 }
			);
		}

		const duration = Date.now() - startTime;
		console.log(`✅ [PATCH /api/chats/[chatId]] Success:`, {
			chatId: `${chatId.substring(0, 8)}...`,
			updatedFields: Object.keys(body),
			status: updatedChat.status,
			duration: `${duration}ms`,
		});

		return NextResponse.json(updatedChat);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(
			`❌ [PATCH /api/chats/[chatId]] Error after ${duration}ms:`,
			error
		);
		return NextResponse.json(
			{ error: "Failed to update chat" },
			{ status: 500 }
		);
	}
}
