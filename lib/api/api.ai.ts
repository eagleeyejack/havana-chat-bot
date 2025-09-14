import { isApiError } from "./api.utils";

export interface AIRequest {
	chatId: string;
	userMessage: string;
	conversationHistory: Array<{
		role: "student" | "bot" | "admin";
		content: string;
	}>;
}

export interface AIResponse {
	success: boolean;
	message: {
		id: string;
		role: "bot";
		content: string;
		meta: string;
	};
	sources: Array<{
		id: string;
		title: string;
		keywords: string[];
		text: string;
	}>;
	analysis: {
		escalationSuggested: boolean;
		bookingSuggested: boolean;
	};
}

/**
 * Generate AI response using OpenAI with knowledge base integration
 * @param request - AI request data
 * @returns Promise<AIResponse> - AI response with sources and analysis
 * @throws Error if the request fails
 */
export async function generateAIResponse(
	request: AIRequest
): Promise<AIResponse> {
	const response = await fetch("/api/ai/chat", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(request),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to generate AI response: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	return data;
}
