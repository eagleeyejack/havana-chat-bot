import { Message, User } from "@/lib/db/schema";
import { Bot, Shield, User as UserIcon } from "lucide-react";

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

const getMessageBgColor = (role: Message["role"]) => {
	switch (role) {
		case "student":
			return "bg-blue-500 text-white ml-auto";
		case "bot":
			return "bg-gray-100 text-gray-900";
		case "admin":
			return "bg-amber-100 text-amber-900";
		default:
			return "bg-gray-100 text-gray-900";
	}
};

const MessagesChatBubble = ({
	message,
	currentUser,
}: {
	message: Message;
	currentUser: User;
}) => {
	return (
		<div
			key={message.id}
			className={`flex ${
				message.role === "student" ? "justify-end" : "justify-start"
			}`}
		>
			<div
				className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageBgColor(
					message.role
				)}`}
			>
				<div className="flex items-center gap-2 mb-1">
					{getMessageIcon(message.role)}
					<span className="text-xs font-medium">
						{message.role === "student"
							? currentUser?.name
							: message.role === "bot"
							? "Assistant"
							: "Admin"}
					</span>
				</div>
				<p className="text-sm whitespace-pre-wrap">{message.content}</p>
				<p className="text-xs opacity-70 mt-1">
					{new Date(message.createdAt).toLocaleTimeString()}
				</p>
			</div>
		</div>
	);
};

export default MessagesChatBubble;
