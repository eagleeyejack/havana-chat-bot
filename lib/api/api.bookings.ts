import { isApiError } from "./api.utils";

export interface BookingSlot {
	timeISO: string;
	displayTime: string;
	displayDate: string;
}

export interface CreateBookingRequest {
	chatId: string;
	name: string;
	email: string;
	timeISO: string;
}

export interface BookingResponse {
	success: boolean;
	booking: {
		id: string;
		name: string;
		email: string;
		scheduledTime: string;
		createdAt: string;
	};
}

export interface AvailableSlotsResponse {
	success: boolean;
	date: string;
	availableSlots: BookingSlot[];
	totalSlots: number;
}

/**
 * Get globally available booking slots for a specific date
 * @param chatId - Chat ID (maintains API consistency, enables future chat-specific features)
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise<AvailableSlotsResponse> - Global available slots (same for all students)
 * @throws Error if the request fails
 */
export async function getAvailableSlots(
	chatId: string,
	date: string
): Promise<AvailableSlotsResponse> {
	const response = await fetch(
		`/api/chats/booking/available?chatId=${chatId}&date=${date}`
	);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch available slots: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}

/**
 * Create a new booking
 * @param request - Booking creation request data
 * @returns Promise<BookingResponse> - Created booking
 * @throws Error if the request fails
 */
export async function createBooking(
	request: CreateBookingRequest
): Promise<BookingResponse> {
	const { chatId, ...bookingData } = request;

	const response = await fetch(`/api/chats/booking?chatId=${chatId}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(bookingData),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to create booking: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}

/**
 * Get booking for a specific chat
 * @param chatId - Chat ID
 * @returns Promise<BookingResponse> - Existing booking
 * @throws Error if the request fails
 */
export async function getBookingByChat(
	chatId: string
): Promise<BookingResponse> {
	const response = await fetch(`/api/chats/booking?chatId=${chatId}`);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch booking: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}

export interface BookingData {
	id: string;
	chatId: string;
	name: string;
	email: string;
	scheduledTime: string;
	createdAt: string;
}

export interface BookingsResponse {
	success: boolean;
	bookings: BookingData[];
	count: number;
}

/**
 * Fetch all bookings with optional filters
 * @param options - Query options
 * @returns Promise<BookingData[]> - List of bookings
 * @throws Error if the request fails
 */
export async function fetchBookings(
	options: {
		count?: number;
		chatId?: string;
		email?: string;
	} = {}
): Promise<BookingData[]> {
	const params = new URLSearchParams();
	if (options.count) params.append("count", options.count.toString());
	if (options.chatId) params.append("chatId", options.chatId);
	if (options.email) params.append("email", options.email);

	const response = await fetch(`/api/bookings?${params.toString()}`);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch bookings: ${response.status} ${response.statusText}`
		);
	}

	const data: BookingsResponse = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data.bookings;
}
