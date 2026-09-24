/**
 * File: modules/hooks/payment/usePaymentStatusSingleCall.ts
 * Description: Custom hook for single payment status API call.
 * Used by completion and payment-failure pages.
 *
 * Responsibilities:
 * - Extract orderID from query parameters
 * - Save orderID to Redux
 * - Call payment status API once
 * - Remove orderID query parameter from URL
 * - Handle errors gracefully
 */

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	clearError,
	fetchPaymentStatus,
	selectOrderId,
	selectPaymentReferenceId,
	selectPaymentStatusError,
	selectPaymentStatusIsPending,
} from "@/store/slices/payment-status/payment-status.slice";

/**
 * Configuration for single-call hook behavior.
 */
export interface UsePaymentStatusSingleCallConfig {
	orderId?: string;
	/** If true, auto-fetch on mount. Default: true */
	autoFetch?: boolean;
	/** If true, remove query param after fetching. Default: true */
	removeQueryParam?: boolean;
	/** Currency code for API call. Default: "JPY" */
	currency?: string;
	/** Language code for API call. Default: "en" */
	language?: string;
	/** Optional callback on error */
	onError?: (error: string) => void;
	/** Optional callback on success */
	onSuccess?: () => void;
}

/**
 * Hook return value with state and utilities.
 */
export interface UsePaymentStatusSingleCallReturn {
	/** Order ID extracted from query params */
	orderId: string | null;
	/** Payment reference ID from Redux */
	paymentReferenceId: number | null;
	/** Current API call loading state */
	isPending: boolean;
	/** Error message if API call failed */
	error: string | null;
	/** Manually trigger the API call */
	refetch: () => Promise<void>;
	/** Clear error state */
	clearErrorState: () => void;
}

/**
 * Custom hook for single payment status API call.
 * Extracts orderID from query params, calls API once, removes param.
 *
 * @param config - Hook configuration
 * @returns Object with orderId, isPending, error, refetch, clearErrorState
 *
 * @example
 * export default function CompletionPage() {
 *   const { orderId, isPending, error } = usePaymentStatusSingleCall();
 *
 *   if (isPending) return <Loading />;
 *   if (error) return <Error message={error} />;
 *   if (!orderId) return <NotFound />;
 *
 *   return <CompletionContent orderId={orderId} />;
 * }
 */
export function usePaymentStatusSingleCall(
	config: UsePaymentStatusSingleCallConfig = {}
): UsePaymentStatusSingleCallReturn {
	const {
		autoFetch = true,
		removeQueryParam = true,
		currency = "JPY",
		language = "en",
		onError,
		onSuccess,
	} = config;

	// Hooks
	const dispatch = useAppDispatch();
	const searchParams = useSearchParams();
	const orderId = useAppSelector(selectOrderId);
	const paymentReferenceId = useAppSelector(selectPaymentReferenceId);
	const isPending = useAppSelector(selectPaymentStatusIsPending);
	const error = useAppSelector(selectPaymentStatusError);

	// Refs to prevent duplicate calls
	const hasFetchedRef = useRef(false);
	const hasRemovedParamRef = useRef(false);

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
	// Auto-fetch payment status on mount (when orderId is available)
	// ─────────────────────────────────────────────────────────────────────────

	useEffect(() => {
		if (!autoFetch || !orderId || hasFetchedRef.current) {
			return;
		}

		// Mark as fetched to prevent duplicate calls
		hasFetchedRef.current = true;

		// Dispatch thunk to fetch payment status
		dispatch(
			fetchPaymentStatus({
				orderId,
				paymentReferenceId: paymentReferenceId ?? 0,
				currency,
				language,
			})
		)
			.then(() => {
				onSuccess?.();
			})
			.catch((error) => {
				const errorMsg = error?.payload || "Failed to fetch payment status";
				onError?.(errorMsg);
			});
	}, [orderId, paymentReferenceId, autoFetch, currency, language, dispatch, onSuccess, onError]);

	// ─────────────────────────────────────────────────────────────────────────
	// Manual refetch function
	// ─────────────────────────────────────────────────────────────────────────

	const refetch = async () => {
		if (!orderId) {
			throw new Error("No orderID available for refetch");
		}

		try {
			await dispatch(
				fetchPaymentStatus({
					orderId,
					paymentReferenceId: paymentReferenceId ?? 0,
					currency,
					language,
				})
			).unwrap();
			onSuccess?.();
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : "Refetch failed";
			onError?.(errorMsg);
			throw err;
		}
	};

	// ─────────────────────────────────────────────────────────────────────────
	// Clear error state
	// ─────────────────────────────────────────────────────────────────────────

	const clearErrorState = () => {
		dispatch(clearError());
	};

	return {
		orderId,
		paymentReferenceId,
		isPending,
		error,
		refetch,
		clearErrorState,
	};
}
