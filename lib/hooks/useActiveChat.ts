import { useState, useEffect } from "react";
import { type ApiChat } from "@/lib/api/api.chats";

/**
 * Simplified hook to manage active chat selection
 * @param currentUserId - Current user ID to detect user changes
 * @returns Object with activeChat state and setter
 */
export function useActiveChat(currentUserId: string | undefined) {
	const [activeChat, setActiveChat] = useState<ApiChat | null>(null);

	// Clear active chat when user changes
	useEffect(() => {
		setActiveChat(null);
	}, [currentUserId]);

	return {
		activeChat,
		setActiveChat,
	};
}
