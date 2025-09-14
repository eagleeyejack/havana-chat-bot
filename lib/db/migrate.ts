import { sql } from "drizzle-orm";
import { db } from "./init";

/**
 * Run database migrations - creates tables if they don't exist
 */
export async function runMigrations() {
	try {
		// Create the users table
		await db.run(sql`
			CREATE TABLE IF NOT EXISTS "users" (
				"id" text PRIMARY KEY NOT NULL,
				"name" text NOT NULL,
				"email" text NOT NULL,
				"createdAt" integer NOT NULL,
				UNIQUE("email")
			);
		`);

		console.log("✅ Migrations completed successfully");
		return true;
	} catch (error) {
		console.error("❌ Migration failed:", error);
		throw new Error("Failed to run migrations");
	}
}
