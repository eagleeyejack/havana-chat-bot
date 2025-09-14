import { User } from "@/lib/db/schema";
import { isApiError } from "./api.utils";

//
export interface UsersApiResponse {
	users: User[];
	count: number;
}

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

	return data.users;
}
