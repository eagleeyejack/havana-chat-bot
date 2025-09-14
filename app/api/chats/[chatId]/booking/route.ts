import { NextRequest, NextResponse } from "next/server";
import {
	createBooking,
	getBookingByChat,
	getBookings,
} from "@/lib/db/actions/actions.bookings";
import { updateChat } from "@/lib/db/actions/actions.chats";
import { v4 as uuidv4 } from "uuid";

/**
 * GET /api/chats/[chatId]/booking - Get booking for a specific chat
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { chatId } = params;

		if (!chatId) {
			return NextResponse.json(
				{ error: "Chat ID is required" },
				{ status: 400 }
			);
		}

		const booking = await getBookingByChat(chatId);

		if (!booking) {
			return NextResponse.json(
				{ error: "No booking found for this chat" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			booking: {
				id: booking.id,
				name: booking.name,
				email: booking.email,
				scheduledTime: booking.timeISO,
				createdAt: booking.createdAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("Error fetching booking:", error);
		return NextResponse.json(
			{ error: "Failed to fetch booking" },
			{ status: 500 }
		);
	}
}

/**
 * POST /api/chats/[chatId]/booking - Create a new booking for a chat
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { chatId: string } }
) {
	try {
		const { chatId } = params;
		const body = await request.json();
		const { name, email, timeISO } = body;

		if (!chatId || !name || !email || !timeISO) {
			return NextResponse.json(
				{ error: "Chat ID, name, email, and timeISO are required" },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		// Validate time format and ensure it's in the future
		const scheduledTime = new Date(timeISO);
		if (isNaN(scheduledTime.getTime())) {
			return NextResponse.json(
				{ error: "Invalid time format" },
				{ status: 400 }
			);
		}

		if (scheduledTime <= new Date()) {
			return NextResponse.json(
				{ error: "Scheduled time must be in the future" },
				{ status: 400 }
			);
		}

		// Check if there's already a booking for this chat
		const existingBooking = await getBookingByChat(chatId);
		if (existingBooking) {
			return NextResponse.json(
				{ error: "A booking already exists for this chat" },
				{ status: 409 }
			);
		}

		// Check if the selected time slot is already taken
		const existingBookingsAtTime = await getBookings({
			count: 10, // Check a reasonable number of bookings
		});

		const timeSlotTaken = existingBookingsAtTime.some((booking) => {
			const bookingTime = new Date(booking.timeISO);
			const timeDiff = Math.abs(bookingTime.getTime() - scheduledTime.getTime());
			return timeDiff < 15 * 60 * 1000; // 15 minutes in milliseconds
		});

		if (timeSlotTaken) {
			return NextResponse.json(
				{ error: "This time slot is already booked" },
				{ status: 409 }
			);
		}

		// Create the booking
		const bookingId = uuidv4();
		const newBooking = await createBooking({
			id: bookingId,
			chatId,
			name: name.trim(),
			email: email.trim().toLowerCase(),
			timeISO,
		});

		// Update chat status to "call_booked"
		await updateChat(chatId, {
			status: "call_booked" as const,
			lastMessageAt: new Date(),
		});

		return NextResponse.json({
			success: true,
			booking: {
				id: newBooking.id,
				name: newBooking.name,
				email: newBooking.email,
				scheduledTime: newBooking.timeISO,
				createdAt: newBooking.createdAt.toISOString(),
			},
		});
	} catch (error) {
		console.error("Error creating booking:", error);
		return NextResponse.json(
			{ error: "Failed to create booking" },
			{ status: 500 }
		);
	}
}
