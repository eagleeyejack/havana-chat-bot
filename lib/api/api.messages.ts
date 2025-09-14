import { Message } from "@/lib/db/schema";
import { isApiError } from "./api.utils";

//
export interface MessagesApiResponse {
	messages: Message[];
	count: number;
}

export type ApiMessage = Message;

export interface FetchMessagesOptions {
	chatId?: string;
	role?: "student" | "bot" | "admin";
	count?: number;
}

export interface CreateMessageData {
	chatId: string;
	role: "student" | "bot" | "admin";
	content: string;
	meta?: string;
}

export interface UpdateMessageData {
	id: string;
	content?: string;
	meta?: string;
}

/**
 * Fetch messages with optional filtering
 * @param options - Options for filtering messages
 * @returns Promise<ApiMessage[]> - Array of messages
 * @throws Error if the request fails
 */
export async function fetchMessages(
	options: FetchMessagesOptions = {}
): Promise<ApiMessage[]> {
	const params = new URLSearchParams();

	if (options.chatId) params.append("chatId", options.chatId);
	if (options.role) params.append("role", options.role);
	if (options.count) params.append("count", options.count.toString());

	const response = await fetch(`/api/messages?${params.toString()}`);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch messages: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}

/**
 * Fetch messages for a specific chat
 * @param chatId - The ID of the chat
 * @param count - Number of messages to retrieve (default: 50)
 * @returns Promise<ApiMessage[]> - Array of messages for the chat
 * @throws Error if the request fails
 */
export async function fetchMessagesByChat(
	chatId: string,
	count: number = 50
): Promise<ApiMessage[]> {
	return fetchMessages({ chatId, count });
}

/**
 * Create a new message
 * @param messageData - Data for creating the message
 * @returns Promise<ApiMessage> - The created message
 * @throws Error if the request fails
 */
export async function createMessage(
	messageData: CreateMessageData
): Promise<ApiMessage> {
	const response = await fetch("/api/messages", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(messageData),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to create message: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}

/**
 * Update an existing message
 * @param updateData - Data for updating the message
 * @returns Promise<ApiMessage> - The updated message
 * @throws Error if the request fails
 */
export async function updateMessage(
	updateData: UpdateMessageData
): Promise<ApiMessage> {
	const response = await fetch("/api/messages", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(updateData),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to update message: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}
