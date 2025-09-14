import { NextRequest, NextResponse } from "next/server";
import { getAdminChatsEnriched } from "@/lib/db/actions/actions.chats";

/**
 * GET /api/admin/chats - Get enriched admin chat data
 * Query parameters:
 * - status: "open" | "escalated" | "closed" | "call_booked" (optional - if not provided, fetches all chats)
 * - count: number (default: 50)
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Parse query parameters
		const status = searchParams.get("status") as
			| "open"
			| "escalated"
			| "closed"
			| "call_booked"
			| null;
		const count = searchParams.get("count");

		// Validate status parameter
		const validStatuses = ["open", "escalated", "closed", "call_booked"];
		if (status && !validStatuses.includes(status)) {
			return NextResponse.json(
				{
					error:
						"Invalid status parameter. Must be one of: open, escalated, closed, call_booked",
				},
				{ status: 400 }
			);
		}

		// Validate count parameter
		let parsedCount: number | undefined;
		if (count) {
			parsedCount = parseInt(count, 10);
			if (isNaN(parsedCount) || parsedCount <= 0 || parsedCount > 1000) {
				return NextResponse.json(
					{
						error:
							"Invalid count parameter. Must be a positive integer between 1 and 1000",
					},
					{ status: 400 }
				);
			}
		}

		// Get enriched admin chats using the optimized database function
		const enrichedChats = await getAdminChatsEnriched({
			status: status || undefined, // Fetch all chats if no status specified
			count: parsedCount,
		});

		return NextResponse.json({
			chats: enrichedChats,
			count: enrichedChats.length,
		});
	} catch (error) {
		console.error("Error in GET /api/admin/chats:", error);
		return NextResponse.json(
			{
				error: "Failed to fetch admin chats",
				details:
					process.env.NODE_ENV === "development" ? String(error) : undefined,
			},
			{ status: 500 }
		);
	}
}
