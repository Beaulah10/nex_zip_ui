/**
 * File: app/layout.tsx
 * Description: Root layout for the IBE application.
 * Responsible only for global styles and providers.
 * Locale-specific logic is handled in app/[locale]/layout.tsx.
 */
/**
 * File: app/layout.tsx
 */

import "@repo/ui/global.css";
import Providers from "./providers";
import "@repo/global-styles/index.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body>
				<Providers>
					<div className="mx-auto w-full">{children}</div>
				</Providers>
			</body>
		</html>
	);
}
