/**
 * File: modules/hooks/payment/usePaymentStatusPolling.ts
 * Description: Custom hook for polling payment status.
 * Used by pending page only.
 *
 * Responsibilities:
 * - Extract orderID from query parameters
 * - Save orderID to Redux
 * - Poll payment status API every 2 seconds
 * - Stop polling when status is Success or Failure
 * - Stop after maximum 10 minutes
 * - Remove orderID query parameter
 * - Clean up timers on unmount
 */

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	clearError,
	fetchPaymentStatus,
	selectIsPaymentFailure,
	selectIsPaymentSuccess,
	selectOrderId,
	selectPaymentReferenceId,
	selectPaymentStatus,
	selectPaymentStatusError,
	selectPaymentStatusIsPending,
} from "@/store/slices/payment-status/payment-status.slice";

/**
 * Polling configuration.
 */
export interface UsePaymentStatusPollingConfig {
	/** Polling interval in milliseconds. Default: 2000 (2 seconds) */
	pollingIntervalMs?: number;
	/** Maximum polling duration in milliseconds. Default: 600000 (10 minutes) */
	maxDurationMs?: number;
	/** If true, auto-start polling on mount. Default: true */
	autoStart?: boolean;
	/** If true, remove query param after starting poll. Default: true */
	removeQueryParam?: boolean;
	/** Currency code for API call. Default: "JPY" */
	currency?: string;
	/** Language code for API call. Default: "en" */
	language?: string;
	/** Callback when polling succeeds (Success status) */
	onSuccess?: () => void;
	/** Callback when polling fails (Failure status) */
	onFailure?: () => void;
	/** Callback when max duration reached */
	onMaxDurationReached?: () => void;
	/** Callback on error */
	onError?: (error: string) => void;
}

/**
 * Hook return value.
 */
export interface UsePaymentStatusPollingReturn {
	/** Order ID being polled */
	orderId: string | null;
	/** Current payment status */
	paymentStatus: "Success" | "Failure" | "InProgress" | null;
	/** Current API call loading state */
	isPending: boolean;
	/** Error message if API call failed */
	error: string | null;
	/** Whether polling is active */
	isPolling: boolean;
	/** Stop polling manually */
	stopPolling: () => void;
	/** Resume polling manually */
	startPolling: () => void;
	/** Clear error state */
	clearErrorState: () => void;
}

/**
 * Custom hook for polling payment status with timeout.
 * Polls every 2 seconds until Success/Failure or max 10 minutes.
 *
 * @param config - Polling configuration
 * @returns Object with orderId, paymentStatus, isPending, error, isPolling, etc.
 *
 * @example
 * export default function PendingPage() {
 *   const { orderId, paymentStatus, isPending, isPolling, stopPolling } =
 *     usePaymentStatusPolling({ maxDurationMs: 600000 });
 *
 *   if (!isPolling && paymentStatus === "Success") return <Success />;
 *   if (!isPolling && paymentStatus === "Failure") return <Failure />;
 *   if (!isPolling) return <MaxDurationReached />;
 *
 *   return <Polling isPending={isPending} />;
 * }
 */
export function usePaymentStatusPolling(
	config: UsePaymentStatusPollingConfig = {}
): UsePaymentStatusPollingReturn {
	const {
		pollingIntervalMs = 2000,
		maxDurationMs = 600000,
		autoStart = true,
		removeQueryParam = true,
		currency = "JPY",
		language = "en",
		onSuccess,
		onFailure,
		onMaxDurationReached,
		onError,
	} = config;

	// Hooks
	const dispatch = useAppDispatch();
	const searchParams = useSearchParams();
	const orderId = useAppSelector(selectOrderId);
	const paymentStatus = useAppSelector(selectPaymentStatus);
	const isPending = useAppSelector(selectPaymentStatusIsPending);
	const error = useAppSelector(selectPaymentStatusError);
	const isSuccess = useAppSelector(selectIsPaymentSuccess);
	const isFailure = useAppSelector(selectIsPaymentFailure);
	const paymentReferenceId = useAppSelector(selectPaymentReferenceId);

	// Refs to manage polling state and timers
	const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isPollingRef = useRef(false);
	const hasRemovedParamRef = useRef(false);
	const startTimeRef = useRef<number>(0);

	// ─────────────────────────────────────────────────────────────────────────
	// Extract orderID from query params and save to Redux
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		const queryOrderId = searchParams.get("orderID");

		if (queryOrderId && !orderId) {
			// Remove query parameter from URL (only once)
			if (removeQueryParam && !hasRemovedParamRef.current) {
				hasRemovedParamRef.current = true;
				window.history.replaceState(
					{},
					"",
					window.location.pathname // Remove query string
				);
			}
		}
	}, [searchParams, orderId, removeQueryParam]);

	// ─────────────────────────────────────────────────────────────────────────
	// Stop polling function
	// ─────────────────────────────────────────────────────────────────────────

	const stopPolling = useCallback(() => {
		if (pollingIntervalRef.current) {
			clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
		if (maxDurationTimeoutRef.current) {
			clearTimeout(maxDurationTimeoutRef.current);
			maxDurationTimeoutRef.current = null;
		}
		isPollingRef.current = false;
	}, []);

	// ─────────────────────────────────────────────────────────────────────────
	// Start polling function
	// ─────────────────────────────────────────────────────────────────────────

	const startPolling = useCallback(() => {
		if (isPollingRef.current || !orderId) {
			return;
		}

		isPollingRef.current = true;
		startTimeRef.current = Date.now();

		// Set max duration timeout
		maxDurationTimeoutRef.current = setTimeout(() => {
			stopPolling();
			onMaxDurationReached?.();
		}, maxDurationMs);

		// Perform initial API call
		dispatch(
			fetchPaymentStatus({
				orderId,
				paymentReferenceId: paymentReferenceId ?? 0,
				currency,
				language,
			})
		).catch((error) => {
			const errorMsg = error?.payload || "Failed to fetch payment status";
			onError?.(errorMsg);
		});

		// Start polling interval
		pollingIntervalRef.current = setInterval(() => {
			if (!isPollingRef.current) {
				return;
			}

			dispatch(
				fetchPaymentStatus({
					orderId,
					paymentReferenceId: paymentReferenceId ?? 0,
					currency,
					language,
				})
			).catch((error) => {
				const errorMsg = error?.payload || "Failed to fetch payment status";
				onError?.(errorMsg);
			});
		}, pollingIntervalMs);
	}, [
		orderId,
		paymentReferenceId,
		currency,
		language,
		maxDurationMs,
		pollingIntervalMs,
		dispatch,
		stopPolling,
		onMaxDurationReached,
		onError,
	]);

	// ─────────────────────────────────────────────────────────────────────────
	// Handle Success status: stop polling and call callback
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (isSuccess && isPollingRef.current) {
			stopPolling();
			onSuccess?.();
		}
	}, [isSuccess, onSuccess, stopPolling]);

	// ─────────────────────────────────────────────────────────────────────────
	// Handle Failure status: stop polling and call callback
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (isFailure && isPollingRef.current) {
			stopPolling();
			onFailure?.();
		}
	}, [isFailure, onFailure, stopPolling]);

	// ─────────────────────────────────────────────────────────────────────────
	// Auto-start polling on mount (when orderId is available)
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (!autoStart) {
			return;
		}

		if (orderId && !isPollingRef.current) {
			startPolling();
		}

		// Cleanup on unmount
		return () => {
			stopPolling();
		};
	}, [orderId, autoStart, stopPolling, startPolling]);

	// ─────────────────────────────────────────────────────────────────────────
	// Clear error state
	// ─────────────────────────────────────────────────────────────────────────

	const clearErrorState = () => {
		dispatch(clearError());
	};

	return {
		orderId,
		paymentStatus,
		isPending,
		error,
		isPolling: isPollingRef.current,
		stopPolling,
		startPolling,
		clearErrorState,
	};
}
