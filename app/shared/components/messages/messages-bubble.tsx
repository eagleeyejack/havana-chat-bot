import { Message } from "@/lib/db/schema";
import { Bot, Shield, User as UserIcon } from "lucide-react";
import { InlineKBSources } from "./message-knowledge-base";
import MessageContent from "./message-markdown";

const getMessageIcon = (role: Message["role"]) => {
	switch (role) {
		case "student":
			return <UserIcon className="w-4 h-4" />;
		case "bot":
			return <Bot className="w-4 h-4" />;
		case "admin":
			return <Shield className="w-4 h-4" />;
		default:
			return <UserIcon className="w-4 h-4" />;
	}
};

const getMessageBgColor = (role: Message["role"], adminView: boolean) => {
	if (adminView) {
		switch (role) {
			case "student":
				return "bg-blue-500 text-white";
			case "bot":
				return "bg-gray-200 text-black";
			case "admin":
				return "bg-purple-500 text-white";
			default:
				return "bg-gray-100 text-gray-900";
		}
	} else {
		switch (role) {
			case "student":
				return "bg-blue-500 text-white";
			case "bot":
				return "bg-gray-100 text-gray-900";
			case "admin":
				return "bg-amber-100 text-amber-900";
			default:
				return "bg-gray-100 text-gray-900";
		}
	}
};

function getMessageRole(role: Message["role"]) {
	return role === "student"
		? "Student"
		: role === "bot"
		? "AI Assistant"
		: "Admin";
}

const MessagesChatBubble = ({
	message,
	showKnowledgeBase = false,
	adminView = false,
}: {
	message: Message;
	showKnowledgeBase?: boolean;
	adminView?: boolean;
}) => {
	const isRightAligned = adminView
		? message.role === "admin" || message.role === "bot"
		: message.role === "student";

	return (
		<div
			key={message.id}
			className={`flex ${isRightAligned ? "justify-end" : "justify-start"}`}
		>
			<div
				data-testid={`message-bubble`}
				data-role={message.role}
				data-message-id={message.id}
				className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageBgColor(
					message.role,
					adminView
				)}`}
			>
				<div className="flex items-center gap-2 mb-1">
					{getMessageIcon(message.role)}
					<span className="text-xs font-medium">
						{getMessageRole(message.role)}
					</span>
				</div>
				<MessageContent
					content={message.content}
					role={message.role}
					adminView={adminView}
				/>
				{showKnowledgeBase && message.role === "bot" && message.meta && (
					<div className="mt-2">
						<InlineKBSources meta={message.meta} />
					</div>
				)}
				<p className="text-xs opacity-70 mt-1">
					{new Date(message.createdAt).toLocaleTimeString()}
				</p>
			</div>
		</div>
	);
};

export default MessagesChatBubble;
