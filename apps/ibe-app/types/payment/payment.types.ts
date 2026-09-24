/**
 * File: types/payment/payment.types.ts
 * Description: TypeScript types and interfaces for payment status flow.
 * Used across Redux slice, components, services, and API integration.
 */

/**
 * Payment status values returned by the payment status API.
 * Maps to NEXUZR006PaymentPaymentStatusResponse status field.
 */
export type PaymentStatus = "Success" | "Failure" | "InProgress";

/**
 * Route segments belonging to the payment status flow (completion, pending,
 * payment-failure). Used to determine whether the flight menu bar should be
 * hidden and whether payment status Redux state should be preserved.
 */
export type PaymentFlowPage = "completion" | "pending" | "payment-failure";

/**
 * Payment information extracted from API response.
 * Represents the order/payment details returned by the payment status endpoint.
 */
export interface PaymentInfo {
	/** Order ID / Payment Order ID from order API response */
	orderId: string;
	paymentReferenceId: number;
	/** Current status of the payment */
	paymentStatus: PaymentStatus;
	/** Confirmation number if available (returned only for successful payments) */
	confirmationNumber?: string;
	/** Timestamp of last update */
	lastUpdated?: string;
}

/**
 * Redux state for payment status.
 * Persisted in localStorage for refresh support.
 */
export interface PaymentStatusState {
	/** Order ID extracted from order API response */
	orderId: string | null;
	/** Payment reference ID from order API response */
	paymentReferenceId: number | null;

	/** Current payment status */
	paymentStatus: PaymentStatus | null;
	/** Confirmation/booking number from API response */
	confirmationNumber: string | null;
	/** ISO timestamp of last API call */
	lastUpdated: string | null;
	/** Loading state during API fetch */
	isPending: boolean;
	/** Error message if API call fails */
	error: string | null;
	/** Full payment info from last successful API response */
	paymentInfo: PaymentInfo | null;
}

/**
 * Request payload for payment status API.
 * Maps to RetrievePaymentStatusRequest from SDK.
 */
export interface PaymentStatusApiRequest {
	/** Status check key from query param */
	statusCheckKey: string;
	/** Reservation currency (e.g., "JPY") */
	currency: string;
	/** Reservation language (e.g., "en", "ja") */
	language: string;
	/** Additional request body (from SDK) */
	nEXUZR006PaymentPaymentStatusRequest?: {
		[key: string]: unknown;
	};
}

/**
 * Async thunk argument for fetchPaymentStatus.
 * Contains all parameters needed to make the API call.
 */
export interface FetchPaymentStatusThunkArg {
	/** Order ID to check status for */
	orderId: string;
	paymentReferenceId: number;
	/** Currency code for the payment */
	currency?: string;
	/** Language code for localization */
	language?: string;
}
