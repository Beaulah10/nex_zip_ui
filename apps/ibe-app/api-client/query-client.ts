/**
 * File: api-client/query-client.ts
 * Description: Centralized TanStack React Query client configuration.
 * This file defines default query behaviors for the entire IBE application.
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * queryClient
 *
 * A single shared instance of QueryClient used across the application.
 *
 * Key responsibilities:
 * - Controls caching behavior
 * - Manages retries and refetching strategies
 * - Provides consistent data-fetching defaults
 *
 * This client is provided globally via <QueryClientProvider>
 * in app/providers.tsx.
 */

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});
