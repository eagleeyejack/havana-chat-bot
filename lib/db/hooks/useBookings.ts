import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchBookings,
	createBooking,
	getBookingByChat,
	getAvailableSlots,
	type CreateBookingRequest,
} from "@/lib/api/api.bookings";

/**
 * Hook to fetch all bookings with React Query
 * @param options - Options for filtering bookings
 * @returns React Query result with bookings data
 */
export function useBookings(
	options: {
		count?: number;
		chatId?: string;
		email?: string;
	} = {}
) {
	return useQuery({
		queryKey: ["bookings", options],
		queryFn: () => fetchBookings(options),
		// Keep previous data while refetching
		placeholderData: (previousData) => previousData,
	});
}

/**
 * Hook to fetch booking for a specific chat
 * @param chatId - Chat ID to fetch booking for
 * @param enabled - Whether to enable the query (default: true)
 */
export function useChatBooking(chatId: string | undefined, enabled = true) {
	return useQuery({
		queryKey: ["booking", { chatId }],
		queryFn: () => getBookingByChat(chatId!),
		enabled: !!chatId && enabled,
		// Keep previous data while refetching
		placeholderData: (previousData) => previousData,
	});
}

/**
 * Hook to fetch available booking slots for a date
 * @param chatId - Chat ID
 * @param date - Date in YYYY-MM-DD format
 * @param enabled - Whether to enable the query (default: true)
 */
export function useAvailableSlots(
	chatId: string | undefined,
	date: string | undefined,
	enabled = true
) {
	return useQuery({
		queryKey: ["availableSlots", { chatId, date }],
		queryFn: () => getAvailableSlots(chatId!, date!),
		enabled: !!chatId && !!date && enabled,
		// Keep data fresh for booking conflicts
		staleTime: 1000 * 60 * 2, // 2 minutes
	});
}

/**
 * Hook to create a new booking
 * @returns Mutation for creating bookings
 */
export function useCreateBooking() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (bookingData: CreateBookingRequest) =>
			createBooking(bookingData),
		onSuccess: (newBooking) => {
			// Invalidate and refetch booking queries
			queryClient.invalidateQueries({ queryKey: ["bookings"] });

			// Invalidate specific chat booking query
			queryClient.invalidateQueries({
				queryKey: ["booking", { chatId: newBooking.booking.id }],
			});

			// Invalidate available slots to reflect new booking
			queryClient.invalidateQueries({ queryKey: ["availableSlots"] });

			// Also invalidate chats to update status
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});
}
