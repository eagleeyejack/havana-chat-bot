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

		const options: {
			count?: number;
			userId?: string;
			status?: Chat["status"];
		} = {};
		if (userId) options.userId = userId;
		if (status) options.status = status;
		if (count) options.count = parseInt(count);

		const chats = await getChats(options);

		return NextResponse.json(chats);
	} catch (error) {
		console.error("Error in GET /api/chats:", error);
		return NextResponse.json(
			{ error: "Failed to fetch chats" },
			{ status: 500 }
		);
	}
}

// POST /api/chats - Create a new chat
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { userId, title, status, tags, adminTakenOver } = body;

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

		return NextResponse.json(newChat);
	} catch (error) {
		console.error("Error in POST /api/chats:", error);
		return NextResponse.json(
			{ error: "Failed to create chat" },
			{ status: 500 }
		);
	}
}

// PUT /api/chats - Update a chat
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { id, ...updateData } = body;

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

		return NextResponse.json(updatedChat);
	} catch (error) {
		console.error("Error in PUT /api/chats:", error);
		return NextResponse.json(
			{ error: "Failed to update chat" },
			{ status: 500 }
		);
	}
}
