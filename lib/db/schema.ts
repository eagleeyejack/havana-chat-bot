import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});

export type User = typeof users.$inferSelect;

export const chats = sqliteTable("chats", {
	id: text("id").primaryKey(),
	userId: text("userId")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	// used to manage status of chat
	status: text("status", {
		enum: ["open", "escalated", "closed", "call_booked"],
	})
		.notNull()
		.default("open"),
	// name of the chat
	title: text("title"),
	// to be able to link topics?
	tags: text("tags"),
	// Allows for intervention in the chat (per spec)
	adminTakenOver: integer("adminTakenOver", { mode: "boolean" })
		.notNull()
		.default(false),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	lastMessageAt: integer("lastMessageAt", { mode: "timestamp_ms" }),
});

export type Chat = typeof chats.$inferSelect;

export const messages = sqliteTable("messages", {
	id: text("id").primaryKey(),
	chatId: text("chatId")
		.notNull()
		.references(() => chats.id, { onDelete: "cascade" }),
	// three types of messages: student (main use case for demo, bot is the AI, admin is the intervention)
	role: text("role", { enum: ["student", "bot", "admin"] }).notNull(),
	content: text("content").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
	meta: text("meta"),
});

export type Message = typeof messages.$inferSelect;

/* used to create a simple list of call bookings 
that admin staff would go through if a student needs it */
export const bookings = sqliteTable("bookings", {
	id: text("id").primaryKey(),
	chatId: text("chatId")
		.notNull()
		.references(() => chats.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	email: text("email").notNull(),
	timeISO: text("timeISO").notNull(),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});

export type Booking = typeof bookings.$inferSelect;

/* 
  used to audit every LLM call made as they can be
  unpredictable if not prompted and provided the correct context 
*/
export const audit_llm = sqliteTable("audit_llm", {
	id: text("id").primaryKey(),
	chatId: text("chatId")
		.notNull()
		.references(() => chats.id, { onDelete: "cascade" }),
	messageId: text("messageId"),
	model: text("model"),
	prompt: text("prompt"),
	context: text("context"),
	response: text("response"),
	usage: text("usage"),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});

export type AuditLLM = typeof audit_llm.$inferSelect;

/* Indexes */

export const usersEmailIdx = index("users_email_idx").on(users.email);
export const chatsUserIdIdx = index("chats_user_id_idx").on(chats.userId);
export const chatsStatusIdx = index("chats_status_idx").on(chats.status);
export const chatsLastMessageIdx = index("chats_last_message_idx").on(
	chats.lastMessageAt
);
export const messagesChatIdIdx = index("messages_chat_id_idx").on(
	messages.chatId
);
export const messagesCreatedAtIdx = index("messages_created_at_idx").on(
	messages.createdAt
);
export const bookingsChatIdIdx = index("bookings_chat_id_idx").on(
	bookings.chatId
);
export const bookingsCreatedAtIdx = index("bookings_created_at_idx").on(
	bookings.createdAt
);
export const auditLlmChatIdIdx = index("audit_llm_chat_id_idx").on(
	audit_llm.chatId
);
export const auditLlmMessageIdIdx = index("audit_llm_message_id_idx").on(
	audit_llm.messageId
);
export const auditLlmCreatedAtIdx = index("audit_llm_created_at_idx").on(
	audit_llm.createdAt
);
