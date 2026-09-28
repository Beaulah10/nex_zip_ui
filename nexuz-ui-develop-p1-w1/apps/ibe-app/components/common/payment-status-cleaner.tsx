"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isPaymentFlowRoute } from "@/modules/utils/constants/payment/constants";
import { useAppDispatch } from "@/store/hooks";
import { clearPaymentStatus } from "@/store/slices/payment-status/payment-status.slice";

/**
 * Clears payment status Redux state on route changes.
 * Preserves state on payment flow pages: completion, pending, payment-failure.
 * Clears state on all other routes.
 */
export function PaymentStatusCleaner(): null {
	const dispatch = useAppDispatch();
	const pathname = usePathname();

	useEffect(() => {
		// Clear payment status when navigating away from the payment flow
		if (!isPaymentFlowRoute(pathname)) {
			dispatch(clearPaymentStatus());
		}
	}, [pathname, dispatch]);

	return null;
}
