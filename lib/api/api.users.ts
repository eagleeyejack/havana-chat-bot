import { User } from "@/lib/db/schema";

// Type for the API response
export interface UsersApiResponse {
	users: User[];
	count: number;
}

// Type for API errors
export interface ApiError {
	error: string;
}

// Type guard to check if response is an error
export function isApiError(data: unknown): data is ApiError {
	return (
		data !== null &&
		typeof data === "object" &&
		"error" in data &&
		typeof (data as ApiError).error === "string"
	);
}

// Export User as ApiUser for consistency with the function signature
export type ApiUser = User;

/**
 * Fetch all users
 * @returns Promise<ApiUser[]> - Array of all users
 * @throws Error if the request fails
 */
export async function fetchUsers(limit: number): Promise<ApiUser[]> {
	const response = await fetch(`/api/users?limit=${limit}`);

	if (!response.ok) {
		throw new Error(
			`Failed to fetch users: ${response.status} ${response.statusText}`
		);
	}

	const data = await response.json();

	if (isApiError(data)) {
		throw new Error(`API Error: ${data.error}`);
	}

	// Return just the users array from the response
	return data.users;
}
