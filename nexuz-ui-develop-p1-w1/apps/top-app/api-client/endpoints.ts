/**
 * API Endpoints Configuration
 *
 * Two sets of endpoints are needed for different parts of the API flow:
 *
 * 1. apiEndpoints (Client-Side)
 *    - Used by: Redux slices to call Next.js API routes
 *    - Format: /${locale}/api/endpoint
 *    - Flow: Browser → Next.js Route (BFF layer)
 *    - Browser-safe URLs with no credentials exposed
 *
 * 2. backendEndpoints (Server-Side)
 *    - Used by: Server services to call real backend API
 *    - Format: /path/to/backend (relative to BACKEND_API_BASE_URL)
 *    - Flow: Next.js Server → Backend API
 *    - Only accessed on server with security token
 *
 * This separation ensures:
 * - Frontend never knows about real backend URLs
 * - Next.js routes act as BFF (Backend for Frontend)
 * - Security tokens stay on server only
 */

export const apiEndpoints = {
	searchRoutes: (locale: string) => `/${locale}/api/search/routes`,
	calendarFares: () => `/api/search/calendar-fares`,
};

export const backendEndpoints = {
	getToken: "/search/routes?languageCode=en",
	searchRoutes: "/search/search/routes",
	calendarFares: "/search/calendar-fares",
};
