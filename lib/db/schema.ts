import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
});

export type User = typeof users.$inferSelect;
