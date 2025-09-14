import { Message } from "../db/schema";
import { KB, KBEntry } from "../static/knowledge-base";

/**
 * Generate system prompt with knowledge base context
 *
 * AI Pass V1 - simple prompt with knowledge base context
 *
 */
export function generateSystemPrompt(relevantKB: KBEntry[]): string {
	let prompt = `You are a helpful AI assistant for Havana College, a modern educational institution in London. You help students with questions about courses, admissions, fees, and general university information.

IMPORTANT GUIDELINES:
- Always be helpful, professional, and friendly
- Use the knowledge base information provided below to answer questions accurately
- If you don't have specific information in the knowledge base, politely say so and suggest they contact the admissions office
- For complex queries that might need human attention, suggest escalation
- For booking requests or detailed personal consultation needs, suggest booking a call
- Keep responses concise but informative
- Always cite your sources when using knowledge base information

`;

	if (relevantKB.length > 0) {
		prompt += "\n\nKNOWLEDGE BASE INFORMATION:\n";
		relevantKB.forEach((entry, index) => {
			prompt += `\n${index + 1}. ${entry.title} (ID: ${entry.id})\n${
				entry.text
			}\n`;
		});
		prompt +=
			"\nPlease reference the appropriate knowledge base entries when answering questions.\n";
	}

	return prompt;
}

/**
 * Determine if escalation or booking should be suggested based on the conversation
 *
 * AI Pass V1 - simple analysis based on keywords and conversation history
 */
export function analyzeConversation(
	userMessage: string,
	conversationHistory: Array<{
		role: Message["role"];
		content: string;
	}>
): {
	escalationSuggested: boolean;
	bookingSuggested: boolean;
} {
	const messageLower = userMessage.toLowerCase();

	const escalationKeywords = [
		"complaint",
		"problem",
		"issue",
		"error",
		"wrong",
		"mistake",
		"disappointed",
		"frustrated",
		"angry",
		"help me",
		"urgent",
		"not working",
		"doesn't work",
		"broken",
		"cannot",
		"can't",
	];

	const bookingKeywords = [
		"speak to someone",
		"talk to",
		"meet with",
		"appointment",
		"call me",
		"phone call",
		"consultation",
		"discuss",
		"explain more",
		"detailed information",
		"one on one",
		"personal",
		"specific situation",
	];

	const escalationSuggested = escalationKeywords.some((keyword) =>
		messageLower.includes(keyword)
	);

	const bookingSuggested =
		bookingKeywords.some((keyword) => messageLower.includes(keyword)) ||
		conversationHistory.length > 6; // Suggest booking for longer conversations

	return { escalationSuggested, bookingSuggested };
}

/**
 * Search knowledge base for relevant entries based on user query
 *
 * AI Pass V1 - simple search based on keywords and title
 */
export function searchKnowledgeBase(
	query: string,
	maxResults: number = 3
): KBEntry[] {
	const queryLower = query.toLowerCase();

	const scoredEntries = KB.map((entry) => {
		let score = 0;

		if (entry.title.toLowerCase().includes(queryLower)) {
			score += 10;
		}

		entry.keywords.forEach((keyword) => {
			if (
				queryLower.includes(keyword.toLowerCase()) ||
				keyword.toLowerCase().includes(queryLower)
			) {
				score += 5;
			}
		});

		if (entry.text.toLowerCase().includes(queryLower)) {
			score += 3;
		}

		const words = queryLower.split(/\s+/);
		words.forEach((word) => {
			if (word.length > 3) {
				// Only consider longer words
				if (entry.keywords.some((k) => k.toLowerCase() === word)) {
					score += 8;
				}
				if (entry.title.toLowerCase().includes(word)) {
					score += 6;
				}
			}
		});

		return { entry, score };
	});

	return scoredEntries
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, maxResults)
		.map(({ entry }) => entry);
}
