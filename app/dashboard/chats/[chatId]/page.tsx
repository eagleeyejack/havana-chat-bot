"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMessages } from "@/lib/api/api.messages";
import { fetchChats, updateChat } from "@/lib/api/api.chats";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, AlertCircle, ArrowLeft, Settings, Clock } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { KBUsageSummary } from "@/components/messages/message-knowledge-base";
import { createMessage } from "@/lib/api/api.messages";
import { generateAIResponse } from "@/lib/api/api.ai";
import MessagesChatBubble from "@/components/messages/messages-bubble";
import MessageInput from "@/components/messages/message-input";
import { usePollingIntervals } from "@/app/shared/stores/settings-store";
import { LAYOUT_HEIGHT } from "../../layout";

/**
 * Admin chat interface page for managing individual conversations
 */
const AdminChatPage = () => {
	const params = useParams();
	const chatId = params.chatId as string;
	const queryClient = useQueryClient();
	const { messagesPollingInterval } = usePollingIntervals();

	const [newMessage, setNewMessage] = useState("");
	const [aiEnabled, setAiEnabled] = useState(true);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const lastProcessedMessageRef = useRef<string | null>(null);

	// Fetch all chats to find the current one
	const { data: chats = [], isLoading: isLoadingChat } = useQuery({
		queryKey: ["chats"],
		queryFn: () => fetchChats({}),
	});

	const currentChat = chats.find((c) => c.id === chatId);

	// Fetch messages for this chat
	const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
		queryKey: ["messages", chatId],
		queryFn: () => fetchMessages({ chatId, count: 100 }),
		refetchInterval: messagesPollingInterval,
		enabled: !!chatId,
	});

	// Create message mutation
	const createMessageMutation = useMutation({
		mutationFn: createMessage,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
			setNewMessage("");
		},
	});

	// Update chat mutation for admin takeover
	const updateChatMutation = useMutation({
		mutationFn: updateChat,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["chats", chatId] });
		},
	});

	// Auto-scroll to bottom when new messages arrive
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Handle typing detection for admin takeover
	useEffect(() => {
		if (newMessage.trim() && aiEnabled && !currentChat?.adminTakenOver) {
			// Admin started typing - disable AI and mark as taken over
			setAiEnabled(false);
			updateChatMutation.mutate({
				id: chatId,
				adminTakenOver: true,
			});
		}
	}, [
		newMessage,
		aiEnabled,
		currentChat?.adminTakenOver,
		chatId,
		updateChatMutation,
	]);

	// AI Response function using OpenAI with knowledge base integration
	const handleAIResponse = useCallback(
		async (userMessage: string) => {
			if (!aiEnabled || currentChat?.adminTakenOver) return;

			try {
				// Prepare conversation history for AI context
				const conversationHistory = messages.map((msg) => ({
					role: msg.role,
					content: msg.content,
				}));

				// Generate AI response using OpenAI with knowledge base integration
				await generateAIResponse({
					chatId,
					userMessage,
					conversationHistory,
				});

				// The AI API creates the message directly in the database,
				// so we just need to invalidate the query to refresh the UI
				queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
			} catch (error) {
				console.error("Error generating AI response:", error);
				// Optionally show error message to admin
			}
		},
		[aiEnabled, currentChat?.adminTakenOver, messages, chatId, queryClient]
	);

	const sendMessage = async () => {
		if (!newMessage.trim() || createMessageMutation.isPending) return;

		const messageContent = newMessage.trim();
		setNewMessage("");

		try {
			// Send admin message
			await createMessageMutation.mutateAsync({
				chatId,
				role: "admin",
				content: messageContent,
			});
		} catch (error) {
			console.error("Error sending message:", error);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	const toggleAI = async () => {
		const newAiState = !aiEnabled;
		setAiEnabled(newAiState);

		// Update chat state
		await updateChatMutation.mutateAsync({
			id: chatId,
			adminTakenOver: !newAiState,
		});
	};

	// Handle new student messages - trigger AI response (only once per message)
	useEffect(() => {
		if (messages.length > 0) {
			const lastMessage = messages[messages.length - 1];
			if (
				lastMessage.role === "student" &&
				aiEnabled &&
				!currentChat?.adminTakenOver &&
				lastProcessedMessageRef.current !== lastMessage.id
			) {
				lastProcessedMessageRef.current = lastMessage.id;
				handleAIResponse(lastMessage.content);
			}
		}
	}, [messages, aiEnabled, currentChat?.adminTakenOver, handleAIResponse]);

	if (isLoadingChat || isLoadingMessages) {
		return (
			<div className="container mx-auto p-6">
				<div className="space-y-4">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-32 w-full" />
					<div className="space-y-2">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-16 w-full" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (!currentChat) {
		return (
			<div className="container mx-auto p-6">
				<div className="text-center">
					<AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
					<h2 className="text-lg font-semibold text-gray-900 mb-2">
						Chat Not Found
					</h2>
					<p className="text-gray-500 mb-4">
						The requested chat could not be found.
					</p>
					<Link href="/dashboard/chats">
						<Button>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Dashboard
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className={`flex flex-col ${LAYOUT_HEIGHT} `}>
			{/* Header */}
			<div className="flex-shrink-0 p-6 border-b bg-white">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Link href="/dashboard/chats">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{currentChat.title || "Untitled Chat"}
							</h1>
							<div className="flex items-center space-x-2 text-sm text-gray-500">
								<Badge
									variant={
										currentChat.adminTakenOver ? "destructive" : "default"
									}
								>
									{currentChat.adminTakenOver ? "Admin Mode" : "AI Mode"}
								</Badge>
								<span>•</span>
								<Clock className="h-3 w-3" />
								<span>
									Created{" "}
									{formatDistanceToNow(new Date(currentChat.createdAt), {
										addSuffix: true,
									})}
								</span>
							</div>
						</div>
					</div>

					{/* AI Toggle */}
					<div className="flex items-center space-x-2">
						<KBUsageSummary messages={messages} />
						<Button
							variant={aiEnabled ? "default" : "outline"}
							size="sm"
							onClick={toggleAI}
							disabled={updateChatMutation.isPending}
						>
							<Settings className="h-4 w-4 mr-2" />
							{aiEnabled ? "Disable AI" : "Enable AI"}
						</Button>
					</div>
				</div>
			</div>

			{/* Messages Area - This will take up the remaining space */}
			<div className="flex-1 flex flex-col min-h-0">
				<ScrollArea className="flex-1 p-6">
					<div className="space-y-4">
						{isLoadingMessages ? (
							<div className="text-center py-8 text-gray-500">
								<p>Loading messages...</p>
							</div>
						) : messages.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								<Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
								<p>No messages in this chat yet.</p>
							</div>
						) : (
							messages.map((message) => (
								<MessagesChatBubble
									key={message.id}
									message={message}
									showKnowledgeBase={true}
									adminView={true}
								/>
							))
						)}
						<div ref={messagesEndRef} />
					</div>
				</ScrollArea>

				{/* Message Input - Fixed at bottom */}
				<div className="flex-shrink-0 p-6 border-t bg-white">
					<MessageInput
						newMessage={newMessage}
						setNewMessage={setNewMessage}
						handleKeyPress={handleKeyPress}
						isSending={createMessageMutation.isPending}
						sendMessage={sendMessage}
						placeholder={
							aiEnabled && !currentChat.adminTakenOver
								? "Type to take over from AI..."
								: "Type your message..."
						}
					/>
					<div className="text-xs text-gray-500 mt-2">
						{aiEnabled && !currentChat.adminTakenOver
							? "AI is currently handling responses. Start typing to take over."
							: "You are managing this conversation."}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminChatPage;
