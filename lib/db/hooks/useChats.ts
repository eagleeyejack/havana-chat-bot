import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchChats,
	createChat,
	updateChat,
	type ApiChat,
	type FetchChatsOptions,
	type CreateChatData,
	type UpdateChatData,
} from "@/lib/api/api.chats";

/**
 * Hook to fetch chats with React Query
 * @param options - Options for filtering chats
 * @returns React Query result with chats data
 */
export function useChats(options: FetchChatsOptions = {}) {
	return useQuery({
		queryKey: ["chats", options],
		queryFn: () => fetchChats(options),
		// Refetch every 2 seconds when focused (for real-time updates)
		refetchInterval: 2000,
		// Keep previous data while refetching
		placeholderData: (previousData) => previousData,
	});
}

/**
 * Hook to fetch chats for a specific user
 * @param userId - User ID to filter chats by
 * @param enabled - Whether to enable the query (default: true)
 */
export function useUserChats(userId: string | undefined, enabled = true) {
	return useQuery({
		queryKey: ["chats", { userId }],
		queryFn: () => fetchChats({ userId: userId! }),
		enabled: !!userId && enabled,
		// Refetch every 2 seconds when focused (for real-time updates)
		refetchInterval: 2000,
		// Keep previous data while refetching
		placeholderData: (previousData) => previousData,
	});
}

/**
 * Hook to create a new chat
 * @returns Mutation for creating chats
 */
export function useCreateChat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (chatData: CreateChatData) => createChat(chatData),
		onSuccess: (newChat) => {
			// Invalidate and refetch chats queries
			queryClient.invalidateQueries({ queryKey: ["chats"] });

			// Optimistically add the new chat to existing queries
			queryClient.setQueryData<ApiChat[]>(
				["chats", { userId: newChat.userId }],
				(oldChats) => (oldChats ? [newChat, ...oldChats] : [newChat])
			);
		},
	});
}

/**
 * Hook to update a chat
 * @returns Mutation for updating chats
 */
export function useUpdateChat() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (updateData: UpdateChatData) => updateChat(updateData),
		onSuccess: (updatedChat) => {
			// Invalidate and refetch chats queries
			queryClient.invalidateQueries({ queryKey: ["chats"] });

			// Update the specific chat in existing queries
			queryClient.setQueryData<ApiChat[]>(
				["chats", { userId: updatedChat.userId }],
				(oldChats) =>
					oldChats?.map((chat) =>
						chat.id === updatedChat.id ? updatedChat : chat
					)
			);
		},
	});
}
