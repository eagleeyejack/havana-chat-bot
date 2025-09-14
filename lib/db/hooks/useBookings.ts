import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchBookings,
	createBooking,
	getBookingByChat,
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

			// Also invalidate chats to update status
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});
}
