#!/usr/bin/env tsx

import { seedUsers } from "../lib/db/users";
import { runMigrations } from "../lib/db/migrate";
import { User } from "@/lib/db/schema";
import { getUsers } from "@/lib/db/actions/actions.users";

async function main() {
	console.log("🌱 Starting database setup...");

	try {
		// Run migrations first
		await runMigrations();

		// Seed the database
		await seedUsers();

		// Show the results
		console.log("\n📋 Current users in database:");
		const users = await getUsers(10);

		users.forEach((user: User, index: number) => {
			console.log(
				`${index + 1}. ${user.name} (${user.email}) - Created: ${new Date(
					user.createdAt
				).toLocaleDateString()}`
			);
		});

		console.log(`\n✨ Total users: ${users.length}`);
	} catch (error) {
		console.error("❌ Seeding failed:", error);
		process.exit(1);
	}
}

main();
