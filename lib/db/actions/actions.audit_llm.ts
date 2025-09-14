import { db } from "../init";
import { AuditLLM, audit_llm } from "../schema";
import { desc, eq, and } from "drizzle-orm";

/**
 * Create a new audit log entry
 * @param auditData - Audit data to create
 * @returns Promise<AuditLLM>
 */
export async function createAuditLog(auditData: {
	id: string;
	chatId: string;
	messageId?: string;
	model?: string;
	prompt?: string;
	context?: string;
	response?: string;
	usage?: string;
}): Promise<AuditLLM> {
	try {
		const newAuditLog = {
			...auditData,
			createdAt: new Date(),
		};

		const result = await db.insert(audit_llm).values(newAuditLog).returning();
		return result[0];
	} catch (error) {
		console.error("Error creating audit log:", error);
		throw new Error("Failed to create audit log");
	}
}

/**
 * Get an audit log by ID
 * @param id - Audit log ID
 * @returns Promise<AuditLLM | null>
 */
export async function getAuditLogById(id: string): Promise<AuditLLM | null> {
	try {
		const result = await db
			.select()
			.from(audit_llm)
			.where(eq(audit_llm.id, id))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		console.error("Error fetching audit log:", error);
		throw new Error("Failed to fetch audit log");
	}
}

/**
 * Get audit logs from the database
 * @param options - Query options
 * @returns Promise<AuditLLM[]>
 */
export async function getAuditLogs(
	options: {
		count?: number;
		chatId?: string;
		messageId?: string;
		model?: string;
	} = {}
): Promise<AuditLLM[]> {
	try {
		const { count = 50, chatId, messageId, model } = options;

		const conditions = [];
		if (chatId) {
			conditions.push(eq(audit_llm.chatId, chatId));
		}
		if (messageId) {
			conditions.push(eq(audit_llm.messageId, messageId));
		}
		if (model) {
			conditions.push(eq(audit_llm.model, model));
		}

		const baseQuery = db.select().from(audit_llm);
		const result =
			conditions.length === 0
				? await baseQuery.orderBy(desc(audit_llm.createdAt)).limit(count)
				: await baseQuery
						.where(conditions.length === 1 ? conditions[0] : and(...conditions))
						.orderBy(desc(audit_llm.createdAt))
						.limit(count);

		return result;
	} catch (error) {
		console.error("Error fetching audit logs:", error);
		throw new Error("Failed to fetch audit logs");
	}
}

/**
 * Get audit logs for a specific chat
 * @param chatId - Chat ID
 * @param count - Number of logs to retrieve (default: 50)
 * @returns Promise<AuditLLM[]>
 */
export async function getAuditLogsByChat(
	chatId: string,
	count: number = 50
): Promise<AuditLLM[]> {
	try {
		const result = await db
			.select()
			.from(audit_llm)
			.where(eq(audit_llm.chatId, chatId))
			.orderBy(desc(audit_llm.createdAt))
			.limit(count);

		return result;
	} catch (error) {
		console.error("Error fetching audit logs for chat:", error);
		throw new Error("Failed to fetch audit logs for chat");
	}
}

/**
 * Get audit logs for a specific message
 * @param messageId - Message ID
 * @returns Promise<AuditLLM[]>
 */
export async function getAuditLogsByMessage(
	messageId: string
): Promise<AuditLLM[]> {
	try {
		const result = await db
			.select()
			.from(audit_llm)
			.where(eq(audit_llm.messageId, messageId))
			.orderBy(desc(audit_llm.createdAt));

		return result;
	} catch (error) {
		console.error("Error fetching audit logs for message:", error);
		throw new Error("Failed to fetch audit logs for message");
	}
}

/**
 * Update an audit log
 * @param id - Audit log ID
 * @param updateData - Data to update
 * @returns Promise<AuditLLM | null>
 */
export async function updateAuditLog(
	id: string,
	updateData: Partial<{
		messageId: string;
		model: string;
		prompt: string;
		context: string;
		response: string;
		usage: string;
	}>
): Promise<AuditLLM | null> {
	try {
		const result = await db
			.update(audit_llm)
			.set(updateData)
			.where(eq(audit_llm.id, id))
			.returning();

		return result[0] || null;
	} catch (error) {
		console.error("Error updating audit log:", error);
		throw new Error("Failed to update audit log");
	}
}

/**
 * Delete an audit log
 * @param id - Audit log ID
 * @returns Promise<boolean>
 */
export async function deleteAuditLog(id: string): Promise<boolean> {
	try {
		const result = await db.delete(audit_llm).where(eq(audit_llm.id, id));
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting audit log:", error);
		throw new Error("Failed to delete audit log");
	}
}
