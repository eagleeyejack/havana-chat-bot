import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const MessageInput = ({
	newMessage,
	setNewMessage,
	handleKeyPress,
	isSending,
	sendMessage,
	placeholder = "Type your message...",
}: {
	newMessage: string;
	setNewMessage: (value: string) => void;
	handleKeyPress: (e: React.KeyboardEvent) => void;
	isSending: boolean;
	sendMessage: () => void;
	placeholder?: string;
}) => {
	return (
		<div className="flex gap-2">
			<Input
				data-testid="message-input"
				value={newMessage}
				onChange={(e) => setNewMessage(e.target.value)}
				onKeyPress={handleKeyPress}
				placeholder={placeholder}
				disabled={isSending}
				className="flex-1"
			/>
			<Button
				data-testid="send-button"
				onClick={sendMessage}
				disabled={!newMessage.trim() || isSending}
				size="sm"
			>
				<Send className="w-4 h-4" />
			</Button>
		</div>
	);
};

export default MessageInput;
