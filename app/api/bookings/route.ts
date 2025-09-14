import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/db/actions/actions.bookings";

/**
 * GET /api/bookings - Get all bookings with optional filters
 */
export async function GET(request: NextRequest) {
	const startTime = Date.now();
	try {
		const { searchParams } = new URL(request.url);
		const count = searchParams.get("count");
		const chatId = searchParams.get("chatId");
		const email = searchParams.get("email");

		console.log(`🔍 [GET /api/bookings] Request params:`, {
			count,
			chatId: chatId ? `${chatId.substring(0, 8)}...` : null,
			email,
			timestamp: new Date().toISOString(),
		});

		const options: {
			count?: number;
			chatId?: string;
			email?: string;
		} = {};

		if (count) options.count = parseInt(count);
		if (chatId) options.chatId = chatId;
		if (email) options.email = email;

		const bookings = await getBookings(options);

		// Format bookings for API response
		const formattedBookings = bookings.map((booking) => ({
			id: booking.id,
			chatId: booking.chatId,
			name: booking.name,
			email: booking.email,
			scheduledTime: booking.timeISO,
			createdAt: booking.createdAt.toISOString(),
		}));

		const duration = Date.now() - startTime;
		console.log(`✅ [GET /api/bookings] Success:`, {
			resultCount: formattedBookings.length,
			filters: Object.keys(options).filter(
				(key) => options[key as keyof typeof options]
			),
			duration: `${duration}ms`,
		});

		return NextResponse.json({
			success: true,
			bookings: formattedBookings,
			count: formattedBookings.length,
		});
	} catch (error) {
		const duration = Date.now() - startTime;
		console.error(`❌ [GET /api/bookings] Error after ${duration}ms:`, error);
		return NextResponse.json(
			{ error: "Failed to fetch bookings" },
			{ status: 500 }
		);
	}
}
