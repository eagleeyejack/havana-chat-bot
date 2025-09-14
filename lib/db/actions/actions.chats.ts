import { db } from "../init";
import { Chat, chats } from "../schema";
import { desc, eq, and } from "drizzle-orm";

/**
 * Create a new chat
 * @param chatData - Chat data to create
 * @returns Promise<Chat>
 */
export async function createChat(chatData: {
	id: string;
	userId: string;
	status?: "open" | "escalated" | "closed" | "call_booked";
	title?: string;
	tags?: string;
	adminTakenOver?: boolean;
}): Promise<Chat> {
	try {
		const newChat = {
			...chatData,
			status: chatData.status || "open",
			adminTakenOver: chatData.adminTakenOver || false,
			createdAt: new Date(),
			lastMessageAt: null,
		};

		const result = await db.insert(chats).values(newChat).returning();
		return result[0];
	} catch (error) {
		console.error("Error creating chat:", error);
		throw new Error("Failed to create chat");
	}
}

/**
 * Get a chat by ID
 * @param id - Chat ID
 * @returns Promise<Chat | null>
 */
export async function getChatById(id: string): Promise<Chat | null> {
	try {
		const result = await db
			.select()
			.from(chats)
			.where(eq(chats.id, id))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		console.error("Error fetching chat:", error);
		throw new Error("Failed to fetch chat");
	}
}

/**
 * Get chats from the database
 * @param options - Query options
 * @returns Promise<Chat[]>
 */
export async function getChats(
	options: {
		count?: number;
		userId?: string;
		status?: "open" | "escalated" | "closed" | "call_booked";
	} = {}
): Promise<Chat[]> {
	try {
		const { count = 10, userId, status } = options;

		const conditions = [];
		if (userId) {
			conditions.push(eq(chats.userId, userId));
		}
		if (status) {
			conditions.push(eq(chats.status, status));
		}

		const baseQuery = db.select().from(chats);
		const result =
			conditions.length === 0
				? await baseQuery.orderBy(desc(chats.createdAt)).limit(count)
				: await baseQuery
						.where(conditions.length === 1 ? conditions[0] : and(...conditions))
						.orderBy(desc(chats.createdAt))
						.limit(count);

		return result;
	} catch (error) {
		console.error("Error fetching chats:", error);
		throw new Error("Failed to fetch chats");
	}
}

/**
 * Update a chat
 * @param id - Chat ID
 * @param updateData - Data to update
 * @returns Promise<Chat | null>
 */
export async function updateChat(
	id: string,
	updateData: Partial<{
		status: "open" | "escalated" | "closed" | "call_booked";
		title: string;
		tags: string;
		adminTakenOver: boolean;
		lastMessageAt: Date;
	}>
): Promise<Chat | null> {
	try {
		const result = await db
			.update(chats)
			.set(updateData)
			.where(eq(chats.id, id))
			.returning();

		return result[0] || null;
	} catch (error) {
		console.error("Error updating chat:", error);
		throw new Error("Failed to update chat");
	}
}

/**
 * Delete a chat
 * @param id - Chat ID
 * @returns Promise<boolean>
 */
export async function deleteChat(id: string): Promise<boolean> {
	try {
		const result = await db.delete(chats).where(eq(chats.id, id));
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting chat:", error);
		throw new Error("Failed to delete chat");
	}
}
