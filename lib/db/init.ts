import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Initialize SQLite database
const sqlite = new Database("./database.db");

// Enable WAL mode for better performance
sqlite.pragma("journal_mode = WAL");

// Initialize Drizzle ORM
export const db = drizzle(sqlite, { schema });

export { schema };
