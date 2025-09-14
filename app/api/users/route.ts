import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/db/actions/actions.users";

export async function GET(request: NextRequest) {
	const startTime = Date.now();
	try {
		const searchParams = request.nextUrl.searchParams;
		const count = searchParams.get("count");
		const limit = count ? parseInt(count, 10) : 10;

		console.log(`🔍 [GET /api/users] Request params:`, {
			limit,
			timestamp: new Date().toISOString(),
		});

		const users = await getUsers(limit);
		const duration = Date.now() - startTime;

		console.log(`✅ [GET /api/users] Success:`, {
			resultCount: users.length,
			limit,
			duration: `${duration}ms`,
		});

		return NextResponse.json({
			users,
			count: users.length,
		});
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [GET /api/users] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}
