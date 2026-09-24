/**
 * File: modules/utils/constants/payment/constants.ts
 * Description: Shared constants for the payment status flow (completion,
 * pending, and payment-failure pages), and for any component that needs to
 * know whether the current route belongs to that flow.
 */

import type { PaymentFlowPage } from "@/types/payment/payment.types";

/**
 * Route segments belonging to the payment status flow.
 * Used to hide the flight menu bar and to decide whether the payment status
 * Redux state should be preserved or cleared on navigation.
 */
export const PAYMENT_FLOW_PAGES: readonly PaymentFlowPage[] = [
	"completion",
	"pending",
	"payment-failure",
];

/**
 * Determines whether a pathname belongs to the payment status flow.
 * Matches exact path segments (not substrings) to avoid false positives for
 * routes that merely contain one of the page names as a substring.
 */
export function isPaymentFlowRoute(pathname: string): boolean {
	const segments = pathname.split("/").filter(Boolean);
	return PAYMENT_FLOW_PAGES.some((page) => segments.includes(page));
}

/** Fallback locale used when the route param is unavailable. */
export const DEFAULT_LOCALE = "en";

/** Booking app origin used for local development redirects (Start Over button). */
export const DEV_BOOKING_ORIGIN = "http://localhost:3002";

/** Payment status polling interval, in milliseconds. */
export const PAYMENT_POLLING_INTERVAL_MS = 2000;

/** Maximum payment status polling duration before showing the timeout dialog, in milliseconds. */
export const PAYMENT_POLLING_MAX_DURATION_MS = 600000;
