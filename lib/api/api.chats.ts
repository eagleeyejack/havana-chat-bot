import { Chat } from "@/lib/db/schema";
import { isApiError } from "./api.utils";

//
export interface ChatsApiResponse {
	chats: Chat[];
	count: number;
}

export type ApiChat = Chat;

export interface FetchChatsOptions {
	userId?: string;
	status?: "open" | "escalated" | "closed" | "call_booked";
	count?: number;
}

export interface CreateChatData {
	userId: string;
	title?: string;
	status?: "open" | "escalated" | "closed" | "call_booked";
	tags?: string;
	adminTakenOver?: boolean;
}

export interface UpdateChatData {
	id: string;
	status?: "open" | "escalated" | "closed" | "call_booked";
	title?: string;
	tags?: string;
	adminTakenOver?: boolean;
	lastMessageAt?: Date;
}

/**
 * Fetch chats with optional filtering
 * @param options - Options for filtering chats
 * @returns Promise<ApiChat[]> - Array of chats
 * @throws Error if the request fails
 */
export async function fetchChats(
	options: FetchChatsOptions = {}
): Promise<ApiChat[]> {
	const params = new URLSearchParams();

	if (options.userId) params.append("userId", options.userId);
	if (options.status) params.append("status", options.status);
	if (options.count) params.append("count", options.count.toString());

	const response = await fetch(`/api/chats?${params.toString()}`);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch chats: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}

/**
 * Create a new chat
 * @param chatData - Data for creating the chat
 * @returns Promise<ApiChat> - The created chat
 * @throws Error if the request fails
 */
export async function createChat(chatData: CreateChatData): Promise<ApiChat> {
	const response = await fetch("/api/chats", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(chatData),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to create chat: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}

/**
 * Update an existing chat
 * @param updateData - Data for updating the chat
 * @returns Promise<ApiChat> - The updated chat
 * @throws Error if the request fails
 */
export async function updateChat(updateData: UpdateChatData): Promise<ApiChat> {
	const response = await fetch("/api/chats", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updateData),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to update chat: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}
