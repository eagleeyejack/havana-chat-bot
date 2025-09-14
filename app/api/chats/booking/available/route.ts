import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/db/actions/actions.bookings";

/**
 * GET /api/chats/[chatId]/booking/available - Get globally available booking slots for a specific date
 *
 * Design decisions:
 * - chatId via query params to match existing API pattern (see /api/messages)
 * - Currently returns global slots, but chatId enables future features like:
 *   - Chat-specific advisor assignment
 *   - Priority booking for escalated chats
 *   - Different availability windows based on chat status
 *   - Per-chat rate limiting and audit trails
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const chatId = searchParams.get("chatId");
		const date = searchParams.get("date");

		// TODO: Future enhancement - could use chatId for:
		// - Chat status-based availability (e.g., escalated chats get priority slots)
		// - Advisor assignment based on chat topic/history
		// - Rate limiting per chat to prevent spam requests

		if (!chatId) {
			return NextResponse.json(
				{ error: "Chat ID parameter is required" },
				{ status: 400 }
			);
		}

		if (!date) {
			return NextResponse.json(
				{ error: "Date parameter is required" },
				{ status: 400 }
			);
		}

		// Validate date format
		const selectedDate = new Date(date);
		if (isNaN(selectedDate.getTime())) {
			return NextResponse.json(
				{ error: "Invalid date format" },
				{ status: 400 }
			);
		}

		// Check if date is in the past
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		selectedDate.setHours(0, 0, 0, 0);

		if (selectedDate < today) {
			return NextResponse.json(
				{ error: "Cannot book slots for past dates" },
				{ status: 400 }
			);
		}

		// Check if it's a weekend
		if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
			return NextResponse.json({
				success: true,
				availableSlots: [],
			});
		}

		// Get all bookings to check for conflicts
		const existingBookings = await getBookings({
			count: 1000, // Get all bookings to check conflicts
		});

		// Generate time slots for the day (9:00 AM to 5:00 PM, 15-minute intervals)
		const slots = [];
		const startHour = 9;
		const endHour = 17;

		for (let hour = startHour; hour < endHour; hour++) {
			for (let minute = 0; minute < 60; minute += 15) {
				const slotTime = new Date(selectedDate);
				slotTime.setHours(hour, minute, 0, 0);

				// Skip lunch break (12:00-13:00)
				if (hour === 12) continue;

				// Skip if slot is in the past for today
				const now = new Date();
				if (
					selectedDate.toDateString() === now.toDateString() &&
					slotTime <= now
				) {
					continue;
				}

				slots.push(slotTime);
			}
		}

		// Filter out booked slots
		const availableSlots = slots.filter((slot) => {
			return !existingBookings.some((booking) => {
				const bookingTime = new Date(booking.timeISO);
				const timeDiff = Math.abs(bookingTime.getTime() - slot.getTime());
				return timeDiff < 15 * 60 * 1000; // 15 minutes buffer
			});
		});

		// Format slots for frontend
		const formattedSlots = availableSlots.map((slot) => ({
			timeISO: slot.toISOString(),
			displayTime: slot.toLocaleTimeString("en-GB", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
			displayDate: slot.toLocaleDateString("en-GB", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			}),
		}));

		return NextResponse.json({
			success: true,
			date,
			availableSlots: formattedSlots,
			totalSlots: formattedSlots.length,
		});
	} catch (error) {
		console.error("Error fetching available slots:", error);
		return NextResponse.json(
			{ error: "Failed to fetch available slots" },
			{ status: 500 }
		);
	}
}
