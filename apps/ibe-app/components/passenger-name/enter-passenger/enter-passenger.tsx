"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { type UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { PassengerSection } from "@/components/passenger-name/passenger-section/passenger-section";
import { usePassengerMapping } from "@/modules/hooks/enter-passenger/use-passenger-mapping";
import { setFocusOnInvalidInput } from "@/modules/utils/helpers/common/field-focus/field-focus";
import { getNextBookingFlowPath } from "@/modules/utils/helpers/common/flow-router/flow-router";
import { isYvrRoute } from "@/modules/utils/helpers/common/route-type/route-type";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import { buildPassengerNames } from "@/modules/utils/helpers/passenger-name/passenger-data/passenger-data";
import {
	getAdultAssignmentMap,
	isValidateAdultAssignment,
	shouldHaveAccompanyingAdult,
} from "@/modules/utils/helpers/passenger-name/passenger-rules/passenger-rules";
import {
	type PassengerFormValues,
	passengerFormSchema,
} from "@/modules/utils/validations/passenger.schema/passenger.schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	selectConfirmedFlight,
	selectConfirmedTotalAmount,
	selectFlightSearchRequest,
} from "@/store/slices/flight-selection/flight-selection.slice";
import type { PassengerValues } from "@/store/slices/passenger/passenger.slice";
import { setPassengerNames } from "@/store/slices/passenger/passenger.slice";

function hasSamePassengerCoreValues(
	currentPassengers: PassengerValues[],
	nextPassengers: Array<
		Pick<
			PassengerValues,
			"id" | "passengerTypeCode" | "associateWithPassengerId" | "firstName" | "lastName"
		>
	>
) {
	if (currentPassengers.length !== nextPassengers.length) {
		return false;
	}

	return nextPassengers.every((nextPassenger, index) => {
		const currentPassenger = currentPassengers[index];

		if (!currentPassenger) {
			return false;
		}

		return (
			currentPassenger.id === nextPassenger.id &&
			currentPassenger.passengerTypeCode === nextPassenger.passengerTypeCode &&
			currentPassenger.associateWithPassengerId === nextPassenger.associateWithPassengerId &&
			currentPassenger.firstName === nextPassenger.firstName &&
			currentPassenger.lastName === nextPassenger.lastName
		);
	});
}

// ── Main Component ────────────────────────────────────────────────────────────

/** Full passenger name input dialog triggered by "Confirm and Proceed" */
export const EnterPassengerDialog = ({ locale }: { locale: string }) => {
	const router = useRouter();
	const dispatch = useAppDispatch();
	const passengerNameLabels = useTranslations("passenger_name_page");
	const flightSearchRequest = useSelector(selectFlightSearchRequest);
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const confirmedTotalAmount = useSelector(selectConfirmedTotalAmount);
	const savedPassengers = useAppSelector((state) => state.passenger.passengers);
	const routeCode = flightSearchRequest?.routes ?? "";
	const processedPassengerSections = useMemo(
		() =>
			flightSearchRequest ? buildPassengerNames(flightSearchRequest, passengerNameLabels) : [],
		[flightSearchRequest, passengerNameLabels]
	);
	const defaultFormValues = usePassengerMapping({
		processedPassengerSections,
		savedPassengers,
	});

	const [isSuccess, setIsSuccess] = useState(false);
	const [showGlobalError, setShowGlobalError] = useState(false);
	const [globalErrorSource, setGlobalErrorSource] = useState<
		"field" | "accompanyAssignment" | null
	>(null);

	const form: UseFormReturn<PassengerFormValues> = useForm<PassengerFormValues>({
		resolver: zodResolver(passengerFormSchema(passengerNameLabels)),
		defaultValues: defaultFormValues,
		mode: "onBlur",
		reValidateMode: "onChange",
	});

	useEffect(() => {
		form.reset(defaultFormValues);
	}, [defaultFormValues, form]);

	const passengers = form.watch("passengers");
	const associatedAdults = getAdultAssignmentMap(passengers);
	const isYvrRouteValue = isYvrRoute(routeCode);
	const { errors: formErrors, isValid } = form.formState;

	useEffect(() => {
		if (showGlobalError && globalErrorSource === "field" && isValid) {
			// All field errors are resolved, clear the global error banner
			setShowGlobalError(false);
			setGlobalErrorSource(null);
		}
	}, [isValid, showGlobalError, globalErrorSource]);

	const adultOptions = processedPassengerSections
		.map((section, index) => {
			if (section.mainLabel !== passengerNameLabels("adult_passenger")) return null;

			const passenger = passengers[index];

			const firstName = passenger?.firstName || "";
			const lastName = passenger?.lastName || "";

			const isComplete = firstName.length > 0 && lastName.length > 0;
			const displayName = isComplete
				? `${firstName} ${lastName}`.trim()
				: `${passengerNameLabels("adult_passenger")} ${section.id}`;

			return {
				value: section.id,
				label: displayName,
				disabled: !isComplete,
			};
		})
		.filter((opt): opt is { value: string; label: string; disabled: boolean } => opt !== null);
	const { fields } = useFieldArray({ control: form.control, name: "passengers" });

	const handleConfirm = (data: PassengerFormValues) => {
		// Validate each passenger's accompanying adult assignment by excluding  the current passenger from the map — prevents self-counting false positives.
		const hasInvalidAssignment = data.passengers.some((p, idx) => {
			if (
				!p.accompanyingAdult ||
				!shouldHaveAccompanyingAdult(p.passengerTypeCode, isYvrRouteValue)
			)
				return false;

			const mapExcludingCurrent = getAdultAssignmentMap(
				data.passengers.filter((_, i) => i !== idx)
			);

			return !isValidateAdultAssignment({
				adultId: p.accompanyingAdult,
				passengerType: p.passengerTypeCode,
				map: mapExcludingCurrent,
				isYvr: isYvrRoute(routeCode),
			});
		});

		if (hasInvalidAssignment) {
			setShowGlobalError(true);
			setGlobalErrorSource("accompanyAssignment");
			return;
		}

		// Redux store gets only the required fields
		const passengers = data.passengers.map((p) => ({
			id: p.id,
			passengerTypeCode: p.passengerTypeCode,
			// Only save accompanying adult if the passenger type requires it
			...(p.accompanyingAdult && shouldHaveAccompanyingAdult(p.passengerTypeCode, isYvrRouteValue)
				? { associateWithPassengerId: p.accompanyingAdult }
				: {}),
			firstName: p.firstName,
			lastName: p.lastName,
		}));

		if (!hasSamePassengerCoreValues(savedPassengers, passengers)) {
			dispatch(setPassengerNames(passengers));
		}

		setIsSuccess(true);
		setShowGlobalError(false);
		setGlobalErrorSource(null);
		router.push(
			getNextBookingFlowPath({
				locale,
				confirmedFlight,
				currentRoute: "flight-selection",
			})
		);
	};

	const handleInvalid = () => {
		setShowGlobalError(true);
		setIsSuccess(false);
		setGlobalErrorSource("field");

		// Wait for React to render aria-invalid="true"
		requestAnimationFrame(() => {
			setFocusOnInvalidInput();
		});
	};

	return (
		<DialogContent
			desktopWidth={1024}
			gap={0}
			className="flex max-h-[90vh] flex-col overflow-hidden"
			onOpenAutoFocus={(e) => {
				e.preventDefault();
				requestAnimationFrame(() => {
					document.getElementById("passenger-0-lastName")?.focus();
				});
			}}
		>
			{/* ── Header ──────────────────────────────────────────────── */}
			<DialogHeader>
				<DialogTitle>{passengerNameLabels("passenger_name")}</DialogTitle>
				<DialogDescription className="mt-1 leading-6">
					{passengerNameLabels("passenger_select")}
				</DialogDescription>
			</DialogHeader>

			{/* -- Scrollable body ---------------------------------------  */}
			<div className="pax-dialog-body flex flex-1 flex-col gap-2 overflow-y-auto p-4 md:gap-4 md:p-6">
				{/* Validation error banner */}
				{showGlobalError && !isSuccess && (
					<Alert variant="error">
						<AlertTitle>{passengerNameLabels("input_error")}</AlertTitle>
						<AlertDescription>{passengerNameLabels("global_error")}</AlertDescription>
					</Alert>
				)}

				{/* Passenger form sections */}
				{fields.map((field, index) => {
					const section = processedPassengerSections[index];
					if (!section) return null;
					const errs = formErrors.passengers?.[index];

					return (
						<PassengerSection
							key={field.id}
							index={index}
							section={section}
							errs={errs}
							control={form.control}
							trigger={form.trigger}
							adultOptions={adultOptions}
							associatedAdults={associatedAdults}
							isYvrRouteValue={isYvrRouteValue}
							passengerNameLabels={passengerNameLabels}
						/>
					);
				})}
			</div>

			{/* ── Footer: total amount + confirm action ────────────────── */}
			<DialogFooter className="flex-col items-center gap-4 border border-gray-300 md:justify-end md:gap-8 md:py-3">
				<div className="pax-dialog-total flex w-full items-end justify-end gap-2 md:w-auto md:justify-start">
					<span className="text-brand-japan-black text-sm leading-6">
						{passengerNameLabels("total_amount_label")}
					</span>
					<span className="font-bold text-4xl text-primary-700 leading-9">
						{formatPrice(confirmedTotalAmount)}
					</span>
				</div>
				<Button
					variant="primary"
					size="xl"
					className="w-full md:w-auto"
					onClick={form.handleSubmit(handleConfirm, handleInvalid)}
				>
					{passengerNameLabels("confirm_button")}
				</Button>
			</DialogFooter>
		</DialogContent>
	);
};
