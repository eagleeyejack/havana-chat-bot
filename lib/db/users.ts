import { db } from "./init";
import { users } from "./schema";

/**
 * Seed the database with example users
 */
export async function seedUsers() {
	const exampleUsers = [
		{
			id: "user_001",
			name: "Alice Johnson",
			email: "alice@example.com",
			createdAt: new Date("2024-01-15T10:30:00Z"),
		},
		{
			id: "user_002",
			name: "Bob Smith",
			email: "bob@example.com",
			createdAt: new Date("2024-01-16T14:45:00Z"),
		},
		{
			id: "user_003",
			name: "Carol Brown",
			email: "carol@example.com",
			createdAt: new Date("2024-01-17T09:15:00Z"),
		},
	];

	try {
		// Insert users one by one to handle potential conflicts gracefully
		for (const user of exampleUsers) {
			try {
				await db.insert(users).values(user);
				console.log(`✅ Inserted user: ${user.name}`);
			} catch {
				// User might already exist (unique email constraint)
				console.log(`⚠️  User ${user.name} might already exist, skipping...`);
			}
		}

		console.log("🎉 Database seeding completed!");
		return true;
	} catch (error) {
		console.error("Error seeding database:", error);
		throw new Error("Failed to seed database");
	}
}
