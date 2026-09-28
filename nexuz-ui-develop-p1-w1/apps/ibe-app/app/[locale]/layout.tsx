import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import BookingStepper from "@/components/booking-stepper/booking-stepper";
import { ConditionalFlightMenuBar } from "@/components/common/conditional-flight-menu-bar";
import { FixedBarsContent } from "@/components/common/flight-menu-bar/flight-menu-bar";
import { PaymentStatusCleaner } from "@/components/common/payment-status-cleaner";
import { SiteHeaderWrapper } from "@/components/common/site-header-wrapper/site-header-wrapper";

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const messages = await getMessages();

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<PaymentStatusCleaner />
			<div className="flex min-h-screen flex-col">
				<SiteHeaderWrapper showBackArrow />
				<ConditionalFlightMenuBar />
				<FixedBarsContent className="flex flex-col">
					<BookingStepper />
					<main className="mx-auto w-full flex-1">{children}</main>
				</FixedBarsContent>
			</div>
		</NextIntlClientProvider>
	);
}
