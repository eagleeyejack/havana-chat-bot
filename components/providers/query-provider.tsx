"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
	// Create a new QueryClient instance for this component
	// Using useState to ensure we don't recreate it on every render
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// Stale time: how long data is considered fresh (5 minutes)
						staleTime: 1000 * 60 * 5,
						// Cache time: how long data stays in cache when not used (10 minutes)
						gcTime: 1000 * 60 * 10,
						// Retry failed requests 1 time (instead of default 3)
						retry: 1,
						// Refetch on window focus in production for fresh data
						refetchOnWindowFocus: process.env.NODE_ENV === "production",
					},
				},
			})
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{/* Show React Query DevTools in development */}
			{process.env.NODE_ENV === "development" && (
				<ReactQueryDevtools initialIsOpen={false} />
			)}
		</QueryClientProvider>
	);
}
