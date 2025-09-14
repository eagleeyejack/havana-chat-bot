export const truncateMessage = (message: string, maxLength = 50) => {
	return message.length > maxLength
		? message.substring(0, maxLength) + "..."
		: message;
};
