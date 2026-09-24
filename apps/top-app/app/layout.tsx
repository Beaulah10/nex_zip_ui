/**
 * File: app/layout.tsx
 * Description: Root layout for the TOP application.
 * Responsible only for global styles and providers.
 * Locale-specific logic is handled in app/[locale]/layout.tsx.
 */
/**
 * File: app/layout.tsx
 */

import "@repo/ui/global.css";
import "@repo/global-styles/index.css";
import type { Metadata } from "next";
import enMessages from "@/messages/en.json";
import Providers from "./providers";

export const metadata: Metadata = {
	title: enMessages.app.flight_search_title,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
