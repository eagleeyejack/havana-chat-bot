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
 * Generate prompt for AI-powered escalation analysis
 * This provides more sophisticated analysis than simple keyword matching
 */
export function generateEscalationAnalysisPrompt(
	userMessage: string,
	conversationHistory: Array<{
		role: Message["role"];
		content: string;
	}>
): string {
	const historyContext = conversationHistory
		.slice(-5) // Last 5 messages for context
		.map((msg) => `${msg.role}: ${msg.content}`)
		.join("\n");

	return `You are an AI assistant helping to analyze student support conversations for escalation needs.

Analyze the following conversation context and latest user message to determine if the situation requires escalation to human support.

CONVERSATION HISTORY (last 5 messages):
${historyContext}

LATEST USER MESSAGE:
${userMessage}

Consider these factors for escalation:
1. Student expressions of frustration, anger, or dissatisfaction
2. Complex issues that may require human expertise
3. Complaints about services or processes
4. Requests that seem beyond AI capabilities
5. Technical problems that haven't been resolved
6. Urgent or time-sensitive matters
7. Emotional distress or personal situations
8. Requests for human contact or speaking to someone

IMPORTANT: Only suggest escalation if there are genuine signs of need for human intervention. Don't escalate for simple questions that can be handled by AI.

Respond in JSON format only:
{
  "escalationNeeded": boolean,
  "confidence": number (0-1),
  "reasons": ["reason1", "reason2"],
  "suggestedResponse": "Brief suggestion for next steps"
}`;
}

/*
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
