import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const MessageInput = ({
	newMessage,
	setNewMessage,
	handleKeyPress,
	isSending,
	sendMessage,
}: {
	newMessage: string;
	setNewMessage: (value: string) => void;
	handleKeyPress: (e: React.KeyboardEvent) => void;
	isSending: boolean;
	sendMessage: () => void;
}) => {
	return (
		<div className="flex gap-2">
			<Input
				value={newMessage}
				onChange={(e) => setNewMessage(e.target.value)}
				onKeyPress={handleKeyPress}
				placeholder="Type your message..."
				disabled={isSending}
				className="flex-1"
			/>
			<Button
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
