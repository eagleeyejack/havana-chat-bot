export interface ApiError {
	error: string;
}

export function isApiError(data: unknown): data is ApiError {
	return (
		data !== null &&
		typeof data === "object" &&
		"error" in data &&
		typeof (data as ApiError).error === "string"
	);
}
