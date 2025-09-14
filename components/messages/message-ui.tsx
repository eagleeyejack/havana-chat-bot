"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Bot } from "lucide-react";
import { useUserStore } from "@/app/shared/stores/user-store";
import { useUserChats, useCreateChat, useChat } from "@/lib/db/hooks/useChats";
import { useChatMessages, useCreateMessage } from "@/lib/db/hooks/useMessages";
import { useActiveChat } from "@/lib/hooks/useActiveChat";
import MessagesChatBubble from "./messages-bubble";
import MessageInput from "./message-input";
import MessagesChatHeader from "./messages-chat-header";
import BookingOfferStudent from "./booking-offer-student";
import StudentStatusOverview from "@/app/student/components/status-overview";

interface MessageUIProps {
	className?: string;
}

export const MessageUI: React.FC<MessageUIProps> = ({ className = "" }) => {
	const { currentUser } = useUserStore();

	const [newMessage, setNewMessage] = useState("");
	const [bookingOffered, setBookingOffered] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const {
		data: chats = [],
		isLoading: isLoadingChats,
		error: chatsError,
	} = useUserChats(currentUser?.id);

	const { activeChat, setActiveChat } = useActiveChat(currentUser?.id);

	const { data: currentChat } = useChat(activeChat?.id, true);

	const {
		data: messages = [],
		isLoading: isLoadingMessages,
		error: messagesError,
	} = useChatMessages(activeChat?.id);

	const createChatMutation = useCreateChat();
	const createMessageMutation = useCreateMessage();

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	React.useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Reset booking offered state when chat status changes to escalated or when switching chats
	React.useEffect(() => {
		if (currentChat?.status === "escalated" || activeChat?.id) {
			setBookingOffered(false);
		}
	}, [currentChat?.status, activeChat?.id]);

	const createNewChat = async () => {
		if (!currentUser) return;

		try {
			const newChat = await createChatMutation.mutateAsync({
				userId: currentUser.id,
				title: "New Chat",
			});
			setActiveChat(newChat);
		} catch (error) {
			console.error("Error creating chat:", error);
		}
	};

	const sendMessage = async () => {
		const canSend =
			!activeChat ||
			!newMessage.trim() ||
			!currentUser ||
			createMessageMutation.isPending;

		if (canSend) return;

		try {
			await createMessageMutation.mutateAsync({
				chatId: activeChat.id,
				role: "student",
				content: newMessage.trim(),
			});
			setNewMessage("");
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

	if (!currentUser) {
		return (
			<div className={`flex items-center justify-center p-8 ${className}`}>
				<p className="text-gray-500">Please select a user to start chatting.</p>
			</div>
		);
	}

	return (
		<div className={`flex h-full ${className}`}>
			{/* Chat List Sidebar */}
			<div className="w-80 bg-white border-r border-gray-200 flex flex-col">
				<div className="p-4 border-b border-gray-200">
					<Button
						data-testid="new-chat-button"
						onClick={createNewChat}
						disabled={createChatMutation.isPending || !currentUser}
						className="w-full"
						variant="default"
					>
						<Plus className="w-4 h-4 mr-2" />
						{createChatMutation.isPending ? "Creating..." : "New Chat"}
					</Button>
				</div>

				<ScrollArea className="flex-1">
					<div className="p-2">
						{isLoadingChats ? (
							<div className="text-center py-8 text-gray-500">
								Loading chats...
							</div>
						) : chatsError ? (
							<div className="text-center py-8 text-red-500">
								Error loading chats. Please try again.
							</div>
						) : chats.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								No chats yet. Create your first chat!
							</div>
						) : (
							chats.map((chat, index) => (
								<MessagesChatHeader
									key={chat.id}
									chat={chat}
									setActiveChat={setActiveChat}
									activeChat={activeChat!}
									index={index}
								/>
							))
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Chat Messages Area */}
			<div className="flex-1 flex flex-col">
				{activeChat ? (
					<>
						{/* Chat Header */}
						<div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
							<h2 className="font-semibold">
								{activeChat.title || "Untitled Chat"}
							</h2>
							<p className="text-sm text-gray-500">
								{(currentChat || activeChat)?.adminTakenOver &&
									" • Admin Intervention Active"}
							</p>
							<StudentStatusOverview
								chatId={activeChat.id}
								chatStatus={(currentChat || activeChat)?.status}
							/>
						</div>

						{/* Messages */}
						<ScrollArea className="flex-1 p-4">
							<div data-testid="messages-container" className="space-y-4">
								{isLoadingMessages ? (
									<div
										data-testid="loading-messages"
										className="text-center py-8 text-gray-500"
									>
										Loading messages...
									</div>
								) : messagesError ? (
									<div
										data-testid="messages-error"
										className="text-center py-8 text-red-500"
									>
										Error loading messages. Please try again.
									</div>
								) : messages.length === 0 ? (
									<div
										data-testid="no-messages"
										className="text-center py-8 text-gray-500"
									>
										No messages yet. Start the conversation!
									</div>
								) : (
									<>
										{messages.map((message) => (
											<MessagesChatBubble
												key={message.id}
												message={message}
												showKnowledgeBase={false}
												adminView={false}
											/>
										))}
									</>
								)}
								<div ref={messagesEndRef} />
							</div>
						</ScrollArea>

						{/* Message Input */}
						<div className="p-4 border-t border-gray-200 bg-white">
							{/* Show booking offer if chat is escalated and not already offered */}
							{currentChat?.status === "escalated" && !bookingOffered && (
								<BookingOfferStudent
									chatId={currentChat.id}
									onBookingComplete={(booking) => {
										console.log("Booking completed:", booking);
										setBookingOffered(true);
										// Optionally refresh chat data to show updated status
									}}
									onDismiss={() => setBookingOffered(true)}
								/>
							)}
							<MessageInput
								newMessage={newMessage}
								setNewMessage={setNewMessage}
								handleKeyPress={handleKeyPress}
								isSending={createMessageMutation.isPending}
								sendMessage={sendMessage}
							/>
						</div>
					</>
				) : (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center">
							<Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								Welcome to Havana College Chat
							</h3>
							<p className="text-gray-500 mb-4">
								Select a chat or create a new one to get started
							</p>
							<Button
								onClick={createNewChat}
								disabled={createChatMutation.isPending || !currentUser}
							>
								<Plus className="w-4 h-4 mr-2" />
								{createChatMutation.isPending
									? "Creating..."
									: "Start New Chat"}
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
