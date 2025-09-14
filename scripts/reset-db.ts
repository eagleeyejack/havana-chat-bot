#!/usr/bin/env tsx

import { existsSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const DB_PATH = path.join(process.cwd(), "database.db");
const DB_SHM_PATH = path.join(process.cwd(), "database.db-shm");
const DB_WAL_PATH = path.join(process.cwd(), "database.db-wal");

console.log("🔄 Resetting local database...");

// Remove existing database files
[DB_PATH, DB_SHM_PATH, DB_WAL_PATH].forEach((filePath) => {
	if (existsSync(filePath)) {
		unlinkSync(filePath);
		console.log(`🗑️  Removed ${path.basename(filePath)}`);
	}
});

try {
	// Run migrations to create fresh database
	console.log("📦 Running migrations...");
	execSync("yarn db:migrate", { stdio: "inherit" });

	console.log("✅ Database reset completed successfully!");
	console.log("💡 You can now run 'yarn db:studio' to view your tables");
} catch (error) {
	console.error("❌ Database reset failed:", error);
	process.exit(1);
}
