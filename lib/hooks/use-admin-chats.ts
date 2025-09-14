import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/lib/api/api.users";
import { fetchMessages } from "@/lib/api/api.messages";
import { useChats } from "@/lib/db/hooks/useChats";

export interface AdminChatData {
	id: string;
	title: string;
	status: string;
	adminTakenOver: boolean;
	createdAt: string;
	lastMessageAt: string | null;
	userName: string;
	userAvatar: string;
	messageCount: number;
	lastMessage: string;
}

/**
 * Hook to fetch chats with enriched data for admin dashboard
 * Uses the existing useChats hook but enriches data with user info and message counts
 */
export function useAdminChats() {
	// Use existing hook for chat data
	const {
		data: chats = [],
		isLoading: chatsLoading,
		error: chatsError,
	} = useChats({ status: "open" });

	// TODO - come back and write a more efficient query for users
	const { data: users = [] } = useQuery({
		queryKey: ["users"],
		queryFn: () => fetchUsers(3),
	});

	// Enrich chat data with user information and message counts
	// TODO - come back and write a more efficient query for messages
	const {
		data: enrichedData,
		isLoading: enrichmentLoading,
		error: enrichmentError,
	} = useQuery({
		queryKey: ["admin-chats-enriched", chats, users],
		queryFn: async (): Promise<{ chats: AdminChatData[] }> => {
			// Create a map of users by ID for quick lookup
			const userMap = new Map(users.map((user) => [user.id, user]));

			// Enrich each chat with additional data
			const enrichedChats = await Promise.all(
				chats.map(async (chat): Promise<AdminChatData> => {
					const user = userMap.get(chat.userId);

					// Get messages for this chat to count and get last message
					let messageCount = 0;
					let lastMessage = "No messages yet";

					try {
						const messages = await fetchMessages({
							chatId: chat.id,
							count: 1,
						});
						messageCount = messages.length;

						if (messages.length > 0) {
							const lastMsg = messages[messages.length - 1];
							lastMessage = lastMsg.content;
							// Truncate if too long
							if (lastMessage.length > 60) {
								lastMessage = lastMessage.substring(0, 60) + "...";
							}
						}
					} catch (error) {
						console.warn(
							`Failed to fetch messages for chat ${chat.id}:`,
							error
						);
					}

					return {
						id: chat.id,
						title: chat.title || "New Chat",
						status: chat.status,
						adminTakenOver: chat.adminTakenOver,
						createdAt: chat.createdAt.toString(),
						lastMessageAt: chat.lastMessageAt?.toString() || null,
						userName: user?.name || "Unknown User",
						userAvatar: user?.name?.charAt(0).toUpperCase() || "?",
						messageCount,
						lastMessage,
					};
				})
			);

			// Sort by most recent activity
			enrichedChats.sort((a, b) => {
				const aTime = a.lastMessageAt
					? new Date(a.lastMessageAt).getTime()
					: new Date(a.createdAt).getTime();
				const bTime = b.lastMessageAt
					? new Date(b.lastMessageAt).getTime()
					: new Date(b.createdAt).getTime();
				return bTime - aTime; // Most recent first
			});

			return { chats: enrichedChats };
		},
		enabled: chats.length > 0 && users.length > 0, // Only run when we have both chats and users
	});

	return {
		data: enrichedData,
		isLoading: chatsLoading || enrichmentLoading,
		error: chatsError || enrichmentError,
	};
}
