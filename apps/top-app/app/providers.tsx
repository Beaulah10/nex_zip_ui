"use client";

import { TooltipProvider } from "@repo/ui/components/tooltip";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "@/store";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ReduxProvider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<TooltipProvider>{children}</TooltipProvider>
			</PersistGate>
		</ReduxProvider>
	);
}
