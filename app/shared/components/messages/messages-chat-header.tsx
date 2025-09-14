import { Chat } from "@/lib/db/schema";

const MessagesChatHeader = ({
	chat,
	setActiveChat,
	activeChat,
	index,
}: {
	chat: Chat;
	setActiveChat: (chat: Chat) => void;
	activeChat: Chat;
	index: number;
}) => {
	return (
		<div
			data-testid={`messages-chat-header-${index}`}
			key={chat.id}
			onClick={() => setActiveChat(chat)}
			className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
				activeChat?.id === chat.id
					? "bg-blue-100 border border-blue-200"
					: "hover:bg-gray-50 border border-transparent"
			}`}
		>
			<div className="font-medium text-sm">{chat.title || "Untitled Chat"}</div>
			{chat.lastMessageAt && (
				<div className="text-xs text-gray-400 mt-1">
					{new Date(chat.lastMessageAt).toLocaleDateString()}
				</div>
			)}
		</div>
	);
};

export default MessagesChatHeader;
