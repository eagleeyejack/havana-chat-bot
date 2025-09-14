import { AdminChatData } from "@/lib/db/actions/actions.chats";
import { isApiError } from "./api.utils";
import { Chat } from "../db/schema";

/**
 * Response interface for the admin chats API endpoint
 */
export interface AdminChatsApiResponse {
	chats: AdminChatData[];
	count: number;
}

/**
 * Options for fetching admin chats
 */
export interface FetchAdminChatsOptions {
	status?: Chat["status"];
	count?: number;
}

/**
 * Fetch enriched admin chat data with user info, message counts, and last messages
 * This function uses an optimized API endpoint that performs a single database query
 * instead of multiple separate queries for maximum efficiency.
 *
 * @param options - Options for filtering and limiting results
 * @returns Promise<AdminChatData[]> - Array of enriched chat data
 * @throws Error if the request fails
 */
export async function fetchAdminChats(
	options: FetchAdminChatsOptions = {}
): Promise<AdminChatData[]> {
	const params = new URLSearchParams();

	if (options.status) params.append("status", options.status);
	if (options.count) params.append("count", options.count.toString());

	const response = await fetch(`/api/admin/chats?${params.toString()}`);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch admin chats: ${response.status} ${response.statusText}`
		);
	}

	const data: AdminChatsApiResponse = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data.chats;
}
