import { db } from "../init";
import { Booking, bookings } from "../schema";
import { desc, eq, and } from "drizzle-orm";

/**
 * Create a new booking
 * @param bookingData - Booking data to create
 * @returns Promise<Booking>
 */
export async function createBooking(bookingData: {
	id: string;
	chatId: string;
	name: string;
	email: string;
	timeISO: string;
}): Promise<Booking> {
	try {
		const newBooking = {
			...bookingData,
			createdAt: new Date(),
		};

		const result = await db.insert(bookings).values(newBooking).returning();
		return result[0];
	} catch (error) {
		console.error("Error creating booking:", error);
		throw new Error("Failed to create booking");
	}
}

/**
 * Get a booking by ID
 * @param id - Booking ID
 * @returns Promise<Booking | null>
 */
export async function getBookingById(id: string): Promise<Booking | null> {
	try {
		const result = await db
			.select()
			.from(bookings)
			.where(eq(bookings.id, id))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		console.error("Error fetching booking:", error);
		throw new Error("Failed to fetch booking");
	}
}

/**
 * Get bookings from the database
 * @param options - Query options
 * @returns Promise<Booking[]>
 */
export async function getBookings(
	options: {
		count?: number;
		chatId?: string;
		email?: string;
	} = {}
): Promise<Booking[]> {
	try {
		const { count = 20, chatId, email } = options;

		const conditions = [];
		if (chatId) {
			conditions.push(eq(bookings.chatId, chatId));
		}
		if (email) {
			conditions.push(eq(bookings.email, email));
		}

		const baseQuery = db.select().from(bookings);
		const result =
			conditions.length === 0
				? await baseQuery.orderBy(desc(bookings.createdAt)).limit(count)
				: await baseQuery
						.where(conditions.length === 1 ? conditions[0] : and(...conditions))
						.orderBy(desc(bookings.createdAt))
						.limit(count);

		return result;
	} catch (error) {
		console.error("Error fetching bookings:", error);
		throw new Error("Failed to fetch bookings");
	}
}

/**
 * Get booking for a specific chat
 * @param chatId - Chat ID
 * @returns Promise<Booking | null>
 */
export async function getBookingByChat(
	chatId: string
): Promise<Booking | null> {
	try {
		const result = await db
			.select()
			.from(bookings)
			.where(eq(bookings.chatId, chatId))
			.limit(1);

		return result[0] || null;
	} catch (error) {
		console.error("Error fetching booking for chat:", error);
		throw new Error("Failed to fetch booking for chat");
	}
}

/**
 * Update a booking
 * @param id - Booking ID
 * @param updateData - Data to update
 * @returns Promise<Booking | null>
 */
export async function updateBooking(
	id: string,
	updateData: Partial<{
		name: string;
		email: string;
		timeISO: string;
	}>
): Promise<Booking | null> {
	try {
		const result = await db
			.update(bookings)
			.set(updateData)
			.where(eq(bookings.id, id))
			.returning();

		return result[0] || null;
	} catch (error) {
		console.error("Error updating booking:", error);
		throw new Error("Failed to update booking");
	}
}

/**
 * Delete a booking
 * @param id - Booking ID
 * @returns Promise<boolean>
 */
export async function deleteBooking(id: string): Promise<boolean> {
	try {
		const result = await db.delete(bookings).where(eq(bookings.id, id));
		return result.changes > 0;
	} catch (error) {
		console.error("Error deleting booking:", error);
		throw new Error("Failed to delete booking");
	}
}
