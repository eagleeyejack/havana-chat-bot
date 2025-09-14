import { NextRequest, NextResponse } from "next/server";
import { getUsers } from "@/lib/api/api.users";

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const count = searchParams.get("count");
		const limit = count ? parseInt(count, 10) : 10;

		const users = await getUsers(limit);

		return NextResponse.json({
			users,
			count: users.length,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}
