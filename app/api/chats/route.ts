import { NextRequest, NextResponse } from "next/server";
import {
	createChat,
	getChats,
	updateChat,
} from "@/lib/db/actions/actions.chats";
import { v4 as uuidv4 } from "uuid";
import { Chat } from "@/lib/db/schema";

// GET /api/chats - Get chats for a user
export async function GET(request: NextRequest) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const status = searchParams.get("status") as
			| "open"
			| "escalated"
			| "closed"
			| "call_booked"
			| null;
		const count = searchParams.get("count");

		console.log(`🔍 [GET /api/chats] Request params:`, {
			userId,
			status,
			count,
			timestamp: new Date().toISOString(),
		});

		const options: {
			count?: number;
			userId?: string;
			status?: Chat["status"];
		} = {};
		if (userId) options.userId = userId;
		if (status) options.status = status;
		if (count) options.count = parseInt(count);

		const chats = await getChats(options);
		const duration = Date.now() - startTime;

		console.log(`✅ [GET /api/chats] Success:`, {
			resultCount: chats.length,
			duration: `${duration}ms`,
			filters: options,
		});

		return NextResponse.json(chats);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [GET /api/chats] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch chats" },
			{ status: 500 }
		);
	}
}

// POST /api/chats - Create a new chat
export async function POST(request: NextRequest) {
	const startTime = Date.now();
	try {
		const body = await request.json();
		const { userId, title, status, tags, adminTakenOver } = body;

		console.log(`🔍 [POST /api/chats] Request body:`, {
			userId,
			title,
			status,
			tags,
			adminTakenOver,
			timestamp: new Date().toISOString(),
		});

		if (!userId) {
			return NextResponse.json(
				{ error: "userId is required" },
				{ status: 400 }
			);
		}

		const chatId = uuidv4();
		const newChat = await createChat({
			id: chatId,
			userId,
			title: title || "New Chat",
			status: status || "open",
			tags,
			adminTakenOver: adminTakenOver || false,
		});

		const duration = Date.now() - startTime;
		console.log(`✅ [POST /api/chats] Success:`, {
			chatId: newChat.id,
			userId: newChat.userId,
			duration: `${duration}ms`,
		});

		return NextResponse.json(newChat);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [POST /api/chats] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to create chat" },
			{ status: 500 }
		);
	}
}

// PUT /api/chats - Update a chat
export async function PUT(request: NextRequest) {
	const startTime = Date.now();
	try {
		const body = await request.json();
		const { id, ...updateData } = body;

		console.log(`🔍 [PUT /api/chats] Request:`, {
			chatId: id,
			updateData,
			timestamp: new Date().toISOString(),
		});

		if (!id) {
			return NextResponse.json(
				{ error: "Chat id is required" },
				{ status: 400 }
			);
		}

		const updatedChat = await updateChat(id, updateData);

		if (!updatedChat) {
			return NextResponse.json({ error: "Chat not found" }, { status: 404 });
		}

		const duration = Date.now() - startTime;
		console.log(`✅ [PUT /api/chats] Success:`, {
			chatId: updatedChat.id,
			fields: Object.keys(updateData),
			duration: `${duration}ms`,
		});

		return NextResponse.json(updatedChat);
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [PUT /api/chats] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to update chat" },
			{ status: 500 }
		);
	}
}
