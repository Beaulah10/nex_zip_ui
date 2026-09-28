/**
 * File: app/providers.tsx
 * Description: Centralized application-level providers.
 * Wraps the app with Redux, Redux Persist and React Query contexts.
 */

"use client";

import { TooltipProvider } from "@repo/ui/components/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/store";
import { queryClient } from "../api-client/query-client";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<ReduxProvider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<QueryClientProvider client={queryClient}>
					<TooltipProvider>{children}</TooltipProvider>
				</QueryClientProvider>
			</PersistGate>
		</ReduxProvider>
	);
}
