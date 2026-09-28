"use client";

import { Stepper } from "@repo/ui/components/stepper";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { useTripType } from "@/modules/hooks/common/trip-type/trip-type";
import {
	getBookingStepperCurrentStep,
	getFlowSteps,
	resolveBookingStepperFlowType,
	resolveBookingStepperRoute,
} from "@/modules/utils/helpers/common/stepper/stepper.helper";

const VISITED_STEPS_STORAGE_KEY = "booking_visited_steps";

/**
 * Renders the booking flow stepper for supported route segments.
 * Returns `null` when the current route does not map to a known flow step.
 */
export default function BookingStepper() {
	const t = useTranslations("common");
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { tripType } = useTripType();
	const [visitedSteps, setVisitedSteps] = useState<number[]>(() => {
		// Initialize from sessionStorage on mount
		if (typeof window === "undefined") return [];
		const stored = sessionStorage.getItem(VISITED_STEPS_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	});

	const route = resolveBookingStepperRoute(pathname);
	const hasReturnDate = searchParams.has("departureDateTo");
	const flowType = resolveBookingStepperFlowType({
		route,
		tripType: tripType ?? (hasReturnDate ? "roundtrip" : undefined),
	});
	const currentStep = getBookingStepperCurrentStep({ route, flowType });

	// Track visited steps - fill in all intermediate steps when navigating backward
	useEffect(() => {
		if (currentStep !== undefined) {
			setVisitedSteps((prev) => {
				const updated = Array.from(prev);

				// Add current step if not already visited
				if (!updated.includes(currentStep)) {
					updated.push(currentStep);
				}

				// Fill in all steps from 0 to max visited step
				// This ensures that when navigating back from a higher step,
				// all intermediate steps are marked as visited
				if (updated.length > 0) {
					const maxStep = Math.max(...updated);
					for (let i = 0; i <= maxStep; i++) {
						if (!updated.includes(i)) {
							updated.push(i);
						}
					}
				}

				// Sort for consistency
				const sorted = updated.sort((a, b) => a - b);

				// Update storage
				sessionStorage.setItem(VISITED_STEPS_STORAGE_KEY, JSON.stringify(sorted));

				return sorted;
			});
		}
	}, [currentStep]);

	if (currentStep === undefined) {
		return null;
	}

	return (
		<section className="bg-background py-[1rem] md:py-[1.5rem]">
			<div className="mx-auto w-full max-w-5xl">
				<Stepper
					currentStep={currentStep}
					steps={getFlowSteps(t, flowType)}
					completedSteps={visitedSteps}
				/>
			</div>
		</section>
	);
}
