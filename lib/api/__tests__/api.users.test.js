import { describe, it, expect, beforeAll } from "vitest";
import { GET } from "@/app/api/users/route";
import { createMockRequest } from "@/test/utils/createMockRequest";

describe("/api/users", () => {
	beforeAll(async () => {
		// Ensure database is seeded before running tests
		const { seedUsers } = await import("@/lib/db/users.js");
		try {
			await seedUsers();
		} catch (error) {
			// Users might already exist, that's okay
			console.log("Database already seeded", error);
		}
	});

	it("should return users with default limit", async () => {
		const request = createMockRequest("http://localhost:3000/api/users");
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toHaveProperty("users");
		expect(data).toHaveProperty("count");
		expect(Array.isArray(data.users)).toBe(true);
		expect(data.count).toBeGreaterThan(0);
	});

	it("should return users with custom limit", async () => {
		const request = createMockRequest(
			"http://localhost:3000/api/users?count=2"
		);
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.users).toHaveLength(2);
		expect(data.count).toBe(2);
	});

	it("should return users with correct structure", async () => {
		const request = createMockRequest(
			"http://localhost:3000/api/users?count=1"
		);
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.users).toHaveLength(1);

		const user = data.users[0];
		expect(user).toHaveProperty("id");
		expect(user).toHaveProperty("name");
		expect(user).toHaveProperty("email");
		expect(user).toHaveProperty("createdAt");

		expect(typeof user.id).toBe("string");
		expect(typeof user.name).toBe("string");
		expect(typeof user.email).toBe("string");
		expect(typeof user.createdAt).toBe("string"); // SQLite timestamps are returned as strings
	});

	it("should handle zero count", async () => {
		const request = createMockRequest(
			"http://localhost:3000/api/users?count=0"
		);
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.users).toHaveLength(0);
		expect(data.count).toBe(0);
	});

	it("should handle invalid count parameter", async () => {
		const request = createMockRequest(
			"http://localhost:3000/api/users?count=invalid"
		);
		const response = await GET(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(Array.isArray(data.users)).toBe(true);
		// Should fall back to default limit (10)
	});
});
