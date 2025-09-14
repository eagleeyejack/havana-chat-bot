import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import { createMessage } from "@/lib/db/actions/actions.messages";
import { updateChat } from "@/lib/db/actions/actions.chats";
import {
	searchKnowledgeBase,
	generateSystemPrompt,
	analyzeConversation,
	generateEscalationAnalysisPrompt,
	generateChatTitlePrompt,
} from "@/lib/open-ai/prompts";
import type { KBEntry } from "@/lib/static/knowledge-base";
import { createAuditLog } from "@/lib/db/actions/actions.audit_llm";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export interface AIGenerateOptions {
	chatId: string;
	userMessage: string;
	conversationHistory: Array<{
		role: "student" | "bot" | "admin";
		content: string;
	}>;
}

export interface AIGenerateResult {
	success: boolean;
	message: {
		id: string;
		role: "bot";
		content: string;
		meta: string;
	};
	sources: KBEntry[];
	analysis: {
		escalationSuggested: boolean;
		bookingSuggested: boolean;
		escalationAnalysis?: {
			escalationNeeded: boolean;
			confidence: number;
			reasons: string[];
			suggestedResponse: string;
		};
	};
}

/**
 * Generate AI response using OpenAI with knowledge base integration
 * This is the core AI logic extracted from the API route for reusability
 */
export async function generateAIResponse(
	options: AIGenerateOptions
): Promise<AIGenerateResult> {
	const { chatId, userMessage, conversationHistory } = options;

	if (!process.env.OPENAI_API_KEY) {
		throw new Error("OpenAI API key not configured");
	}

	// Search knowledge base for relevant information
	const relevantKB = searchKnowledgeBase(userMessage);

	// Prompt for the LLM that contains the knowledge base
	const systemPrompt = generateSystemPrompt(relevantKB);

	const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
		{
			role: "system",
			content: systemPrompt,
		},
		// Add recent conversation history (last 10 messages to stay within token limits)
		...conversationHistory.slice(-10).map((msg) => ({
			role: msg.role === "student" ? ("user" as const) : ("assistant" as const),
			content: msg.content,
		})),
		{
			role: "user",
			content: userMessage,
		},
	];

	// Run AI response and escalation analysis in parallel for better performance
	const [completion, analysis] = await Promise.all([
		openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages,
			max_tokens: 500,
			temperature: 0.7,
		}),
		// Simple keyword-based analysis (fast)
		Promise.resolve(analyzeConversation(userMessage, conversationHistory)),
	]);

	const aiResponse = completion.choices[0]?.message?.content;

	if (!aiResponse) {
		throw new Error("No response from OpenAI");
	}

	const meta = JSON.stringify({
		sources: relevantKB.map((entry) => entry.id),
		escalationSuggested: analysis.escalationSuggested,
		bookingSuggested: analysis.bookingSuggested,
		model: "gpt-4o-mini",
	});

	const messageId = uuidv4();

	// Run message creation and escalation analysis in parallel to improve performance
	const escalationPrompt = generateEscalationAnalysisPrompt(
		userMessage,
		conversationHistory
	);

	const [createdMessage, escalationCompletion] = await Promise.all([
		// Create message in DB
		createMessage({
			id: messageId,
			chatId,
			role: "bot",
			content: aiResponse,
			meta,
		}),
		// Get AI escalation analysis in parallel
		openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: escalationPrompt,
				},
			],
			max_tokens: 300,
			temperature: 0.3,
		}),
	]);

	// Process escalation analysis
	let escalationAnalysis = null;
	try {
		const escalationResponse =
			escalationCompletion.choices[0]?.message?.content;
		if (escalationResponse) {
			try {
				escalationAnalysis = JSON.parse(escalationResponse);
			} catch (parseError) {
				console.warn(
					"Failed to parse escalation analysis:",
					escalationResponse,
					parseError
				);
				// Use fallback analysis
				escalationAnalysis = {
					escalationNeeded: false,
					confidence: 0.1,
					reasons: ["Parse error in escalation analysis"],
					suggestedResponse: "Continue with regular support",
				};
			}
		}
	} catch (error) {
		console.error("Error generating escalation analysis:", error);
	}

	// Update chat status if escalation is needed with high confidence
	if (
		escalationAnalysis?.escalationNeeded &&
		escalationAnalysis.confidence > 0.7
	) {
		try {
			console.log(
				`🚨 [AI Response] Escalation detected for chat ${chatId.substring(
					0,
					8
				)}... (confidence: ${escalationAnalysis.confidence})`
			);
			await updateChat(chatId, {
				status: "escalated" as const,
				lastMessageAt: new Date(),
			});
		} catch (error) {
			console.error("Failed to update chat status to escalated:", error);
			// Continue execution even if status update fails
		}
	}

	// Create audit log for AI interaction
	try {
		await createAuditLog({
			id: uuidv4(),
			chatId,
			messageId,
			model: "gpt-4o-mini",
			prompt: systemPrompt,
			context: JSON.stringify({
				userMessage,
				historyLength: conversationHistory.length,
				knowledgeBaseSources: relevantKB.length,
			}),
			response: aiResponse,
			usage: JSON.stringify({
				promptTokens: "estimated",
				completionTokens: "estimated",
				totalTokens: "estimated",
			}),
		});
	} catch (auditError) {
		// Log audit errors but don't fail the main flow
		console.error("Failed to create audit log:", auditError);
	}

	return {
		success: true,
		message: {
			id: createdMessage.id,
			role: "bot",
			content: aiResponse,
			meta,
		},
		sources: relevantKB,
		analysis: {
			escalationSuggested: analysis.escalationSuggested,
			bookingSuggested: analysis.bookingSuggested,
			escalationAnalysis,
		},
	};
}

/**
 * Generate a chat title using AI based on the first student message
 * @param userMessage - The first student message content
 * @returns Promise<string> - Generated chat title
 */
export async function generateChatTitle(userMessage: string): Promise<string> {
	try {
		if (!process.env.OPENAI_API_KEY) {
			throw new Error("OpenAI API key not configured");
		}

		// Generate the title prompt
		const titlePrompt = generateChatTitlePrompt(userMessage);

		// Get AI-generated title
		const completion = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "user",
					content: titlePrompt,
				},
			],
			max_tokens: 20, // Short titles only
			temperature: 0.7,
		});

		const generatedTitle = completion.choices[0]?.message?.content?.trim();

		if (!generatedTitle) {
			throw new Error("No title generated from OpenAI");
		}

		// Clean up the title (remove any quotes or extra formatting)
		const cleanTitle = generatedTitle
			.replace(/["'`]/g, "")
			.replace(/^\w/, (c) => c.toUpperCase()) // Ensure first letter is capitalized
			.substring(0, 60); // Limit length

		return cleanTitle || "Student Support Chat";
	} catch (error) {
		console.error("Error generating chat title:", error);
		// Return a fallback title instead of throwing
		return "Student Support Chat";
	}
}
