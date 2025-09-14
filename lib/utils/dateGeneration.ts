/**
 * Utility functions for generating date ranges and availability
 */

/**
 * Get next available weekdays for booking selection
 * @param count - Number of weekdays to generate (default: 5)
 * @returns Array of Date objects for next available weekdays
 */
export function getAvailableWeekdays(count: number = 5): Date[] {
	const dates = [];
	const today = new Date();
	const current = new Date(today);

	// Find next weekday if today is weekend
	while (current.getDay() === 0 || current.getDay() === 6) {
		current.setDate(current.getDate() + 1);
	}

	for (let i = 0; i < count; i++) {
		if (current.getDay() !== 0 && current.getDay() !== 6) {
			// Skip weekends
			dates.push(new Date(current));
		} else {
			i--; // Don't count weekend days
		}
		current.setDate(current.getDate() + 1);
	}

	return dates;
}

/**
 * Check if a date is a weekend
 * @param date - Date to check
 * @returns True if weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
	return date.getDay() === 0 || date.getDay() === 6;
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if the date is before today
 */
export function isPastDate(date: Date): boolean {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const compareDate = new Date(date);
	compareDate.setHours(0, 0, 0, 0);

	return compareDate < today;
}
