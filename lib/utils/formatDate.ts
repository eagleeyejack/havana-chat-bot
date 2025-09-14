export const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleString();
};

/**
 * Format a date for display in booking contexts
 * @param date - Date to format
 * @returns Formatted date string (Today, Tomorrow, or full date)
 */
export const formatBookingDate = (date: Date): string => {
	const today = new Date();
	const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

	if (date.toDateString() === today.toDateString()) return "Today";
	if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

	return date.toLocaleDateString("en-GB", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
	});
};

/**
 * Format time in HH:MM format
 * @param date - Date to format
 * @returns Time string in 24-hour format
 */
export const formatBookingTime = (date: Date): string => {
	return date.toLocaleTimeString("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
	});
};

/**
 * Get human-readable time until a future date
 * @param futureDate - Target date
 * @returns Human-readable time description
 */
export const getTimeUntil = (futureDate: Date): string => {
	const now = new Date();
	const diffMs = futureDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) return "Today";
	if (diffDays === 1) return "Tomorrow";
	if (diffDays <= 7) return `In ${diffDays} days`;
	return `In ${Math.ceil(diffDays / 7)} week${diffDays > 14 ? "s" : ""}}`;
};
