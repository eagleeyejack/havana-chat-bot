import { db } from "../init";
import { User, users } from "../schema";
import { desc } from "drizzle-orm";

/**
 * Get users from the database
 * @param count - Number of users to retrieve (default: 10)
 * @returns Promise<User[]>
 */
export async function getUsers(count: number = 10): Promise<User[]> {
	try {
		const result = await db
			.select()
			.from(users)
			.orderBy(desc(users.createdAt))
			.limit(count);

		return result;
	} catch (error) {
		console.error("Error fetching users:", error);
		throw new Error("Failed to fetch users");
	}
}
