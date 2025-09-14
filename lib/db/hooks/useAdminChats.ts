import { useQuery } from "@tanstack/react-query";
import { fetchAdminChats } from "@/lib/api/api.admin";
import { AdminChatData } from "@/lib/db/actions/actions.chats";
import { Chat } from "../schema";

/**
 * Options for the useAdminChats hook
 */
export interface UseAdminChatsOptions {
	status?: Chat["status"];
	count?: number;
	refetchInterval?: number;
}

/**
 * Hook to fetch chats with enriched data for admin dashboard
 * Uses an optimized API endpoint that performs a single database query with JOINs
 * for maximum efficiency. Includes aggressive caching for better performance.
 * If no status is provided, fetches all chats regardless of status.
 */
export function useAdminChats(options: UseAdminChatsOptions = {}) {
	const {
		status,
		count = 50,
		refetchInterval = 30000, // 30 seconds default
	} = options;

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ["admin-chats-optimized", status, count],
		queryFn: () => fetchAdminChats({ status, count }),

		// Aggressive caching configuration for performance
		staleTime: 30000, // Consider data fresh for 30 seconds
		gcTime: 300000, // Keep in cache for 5 minutes after last use

		// Background refetch configuration
		refetchOnWindowFocus: true, // Refetch when user returns to tab
		refetchOnReconnect: true, // Refetch when internet reconnects
		refetchInterval, // Auto-refetch every 30 seconds (configurable)
		refetchIntervalInBackground: true, // Continue refetching in background

		// Retry configuration
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	return {
		data: data ? { chats: data } : undefined,
		isLoading,
		error,
		refetch,
	};
}

// Export the AdminChatData type for convenience
export type { AdminChatData };
