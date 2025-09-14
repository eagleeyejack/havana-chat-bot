import { db } from "../init";
import { Chat, chats, users } from "../schema";
import { desc, eq, and, sql } from "drizzle-orm";

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

/**
 * Get enriched admin chat data with user info, message counts, and last messages in a single efficient query
 * @param options - Query options
 * @returns Promise<AdminChatData[]>
 */
export interface AdminChatData {
	id: string;
	title: string;
	status: string;
	adminTakenOver: boolean;
	createdAt: string;
	lastMessageAt: string | null;
	userName: string;
	userAvatar: string;
	messageCount: number;
	lastMessage: string;
}

export async function getAdminChatsEnriched(
	options: {
		status?: "open" | "escalated" | "closed" | "call_booked";
		count?: number;
	} = {}
): Promise<AdminChatData[]> {
	try {
		const { status, count = 50 } = options;

		// Build the base query with conditional where clause
		const baseQuery = db
			.select({
				id: chats.id,
				title: chats.title,
				status: chats.status,
				adminTakenOver: chats.adminTakenOver,
				createdAt: chats.createdAt,
				lastMessageAt: chats.lastMessageAt,
				userName: users.name,
				userEmail: users.email,
				messageCount: sql<number>`COALESCE(message_stats.message_count, 0)`,
				lastMessage: sql<string>`COALESCE(latest_message.content, 'No messages yet')`,
			})
			.from(chats)
			.innerJoin(users, eq(chats.userId, users.id))
			.leftJoin(
				// Subquery to get message count per chat
				sql`(
					SELECT 
						chatId, 
						COUNT(*) as message_count
					FROM messages 
					GROUP BY chatId
				) as message_stats`,
				sql`message_stats.chatId = ${chats.id}`
			)
			.leftJoin(
				// Subquery to get the latest message per chat
				sql`(
					SELECT DISTINCT
						m1.chatId,
						m1.content
					FROM messages m1
					INNER JOIN (
						SELECT chatId, MAX(createdAt) as max_created_at
						FROM messages
						GROUP BY chatId
					) m2 ON m1.chatId = m2.chatId AND m1.createdAt = m2.max_created_at
				) as latest_message`,
				sql`latest_message.chatId = ${chats.id}`
			);

		// Execute the query with conditional status filter
		const result = status
			? await baseQuery
					.where(eq(chats.status, status))
					.orderBy(
						sql`COALESCE(${chats.lastMessageAt}, ${chats.createdAt}) DESC`
					)
					.limit(count)
			: await baseQuery
					.orderBy(
						sql`COALESCE(${chats.lastMessageAt}, ${chats.createdAt}) DESC`
					)
					.limit(count);

		// Transform the results to match the expected interface
		return result.map((row) => ({
			id: row.id,
			title: row.title || "New Chat",
			status: row.status,
			adminTakenOver: row.adminTakenOver,
			createdAt: row.createdAt.toString(),
			lastMessageAt: row.lastMessageAt?.toString() || null,
			userName: row.userName || "Unknown User",
			userAvatar: row.userName?.charAt(0).toUpperCase() || "?",
			messageCount: row.messageCount,
			lastMessage:
				row.lastMessage.length > 60
					? row.lastMessage.substring(0, 60) + "..."
					: row.lastMessage,
		}));
	} catch (error) {
		console.error("Error fetching enriched admin chats:", error);
		throw new Error("Failed to fetch enriched admin chats");
	}
}
