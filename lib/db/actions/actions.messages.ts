import { db } from "../init";
import { Message, messages } from "../schema";
import { asc, eq, and } from "drizzle-orm";

/**
 * Create a new message
 * @param messageData - Message data to create
 * @returns Promise<Message>
 */
export async function createMessage(messageData: {
	id: string;
	chatId: string;
	role: "student" | "bot" | "admin";
	content: string;
	meta?: string;
}): Promise<Message> {
	try {
		const newMessage = {
			...messageData,
			createdAt: new Date(),
		};

		const result = await db.insert(messages).values(newMessage).returning();
		return result[0];
	} catch (error) {
		console.error("Error creating message:", error);
		throw new Error("Failed to create message");
	}
}

/**
 * Get a message by ID
 * @param id - Message ID
 * @returns Promise<Message | null>
 */
export async function getMessageById(id: string): Promise<Message | null> {
	try {
		const result = await db
			.select()
			.from(messages)
			.where(eq(messages.id, id))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		console.error("Error fetching message:", error);
		throw new Error("Failed to fetch message");
	}
}

/**
 * Get messages from the database
 * @param options - Query options
 * @returns Promise<Message[]>
 */
export async function getMessages(
	options: {
		count?: number;
		chatId?: string;
		role?: "student" | "bot" | "admin";
	} = {}
): Promise<Message[]> {
	try {
		const { count = 50, chatId, role } = options;

		const conditions = [];
		if (chatId) {
			conditions.push(eq(messages.chatId, chatId));
		}
		if (role) {
			conditions.push(eq(messages.role, role));
		}

		const baseQuery = db.select().from(messages);
		const result =
			conditions.length === 0
				? await baseQuery.orderBy(asc(messages.createdAt)).limit(count)
				: await baseQuery
						.where(conditions.length === 1 ? conditions[0] : and(...conditions))
						.orderBy(asc(messages.createdAt))
						.limit(count);

		return result;
	} catch (error) {
		console.error("Error fetching messages:", error);
		throw new Error("Failed to fetch messages");
	}
}

/**
 * Get messages for a specific chat
 * @param chatId - Chat ID
 * @param count - Number of messages to retrieve (default: 50)
 * @returns Promise<Message[]>
 */
export async function getMessagesByChat(
	chatId: string,
	count: number = 50
): Promise<Message[]> {
	try {
		const result = await db
			.select()
			.from(messages)
			.where(eq(messages.chatId, chatId))
			.orderBy(asc(messages.createdAt))
			.limit(count);

		return result;
	} catch (error) {
		console.error("Error fetching messages for chat:", error);
		throw new Error("Failed to fetch messages for chat");
	}
}

/**
 * Update a message
 * @param id - Message ID
 * @param updateData - Data to update
 * @returns Promise<Message | null>
 */
export async function updateMessage(
	id: string,
	updateData: Partial<{
		content: string;
		meta: string;
	}>
): Promise<Message | null> {
	try {
		const result = await db
			.update(messages)
			.set(updateData)
			.where(eq(messages.id, id))
			.returning();

		return result[0] || null;
	} catch (error) {
		console.error("Error updating message:", error);
		throw new Error("Failed to update message");
	}
}

/**
 * Delete a message
 * @param id - Message ID
 * @returns Promise<boolean>
 */
export async function deleteMessage(id: string): Promise<boolean> {
	try {
		const result = await db.delete(messages).where(eq(messages.id, id));
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting message:", error);
		throw new Error("Failed to delete message");
	}
}
