import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	fetchMessages,
	fetchMessagesByChat,
	createMessage,
	type ApiMessage,
	type FetchMessagesOptions,
	type CreateMessageData,
} from "@/lib/api/api.messages";
import { usePollingIntervals } from "@/app/shared/stores/settings-store";

/**
 * Hook to fetch messages with React Query
 * @param options - Options for filtering messages
 * @returns React Query result with messages data
 */
export function useMessages(options: FetchMessagesOptions = {}) {
	const { messagesPollingInterval } = usePollingIntervals();

	return useQuery({
		queryKey: ["messages", options],
		queryFn: () => fetchMessages(options),
		refetchInterval: messagesPollingInterval,
		// Keep previous data while refetching
		placeholderData: (previousData) => previousData,
	});
}

/**
 * Hook to fetch messages for a specific chat
 * @param chatId - Chat ID to fetch messages for
 * @param count - Number of messages to fetch (default: 50)
 * @param enabled - Whether to enable the query (default: true)
 */
export function useChatMessages(
	chatId: string | undefined,
	count = 50,
	enabled = true
) {
	const { messagesPollingInterval } = usePollingIntervals();

	return useQuery({
		queryKey: ["messages", { chatId, count }],
		queryFn: () => fetchMessagesByChat(chatId!, count),
		enabled: !!chatId && enabled,
		refetchInterval: messagesPollingInterval,
		// Keep previous data while refetching
		placeholderData: (previousData) => previousData,
		// Transform data to sort messages by creation time (oldest first)
		select: (data) =>
			data?.sort(
				(a, b) =>
					new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
			),
	});
}

/**
 * Hook to create a new message
 * @returns Mutation for creating messages
 */
export function useCreateMessage() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (messageData: CreateMessageData) => createMessage(messageData),
		onSuccess: (newMessage) => {
			// Invalidate and refetch message queries
			queryClient.invalidateQueries({ queryKey: ["messages"] });

			// Optimistically add the new message to existing chat messages
			queryClient.setQueryData<ApiMessage[]>(
				["messages", { chatId: newMessage.chatId, count: 50 }],
				(oldMessages) => {
					if (!oldMessages) return [newMessage];
					// Add message and keep sorted by creation time
					const updatedMessages = [...oldMessages, newMessage];
					return updatedMessages.sort(
						(a, b) =>
							new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
					);
				}
			);

			// Also invalidate chats to update lastMessageAt
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		},
	});
}
