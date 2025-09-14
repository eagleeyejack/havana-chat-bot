import { useState, useEffect } from "react";
import { type ApiChat } from "@/lib/api/api.chats";

/**
 * Custom hook to manage active chat state with automatic clearing and selection
 * @param currentUserId - Current user ID to detect user changes
 * @param chats - Array of available chats
 * @returns Object with activeChat state and setter
 */
export function useActiveChat(
	currentUserId: string | undefined,
	chats: ApiChat[]
) {
	const [activeChat, setActiveChat] = useState<ApiChat | null>(null);

	// Clear active chat when user changes
	useEffect(() => {
		setActiveChat(null);
	}, [currentUserId]);

	// Auto-select first chat when chats load and no active chat is selected
	useEffect(() => {
		if (!activeChat && chats.length > 0) {
			setActiveChat(chats[0]);
		}
	}, [chats, activeChat]);

	return {
		activeChat,
		setActiveChat,
	};
}
