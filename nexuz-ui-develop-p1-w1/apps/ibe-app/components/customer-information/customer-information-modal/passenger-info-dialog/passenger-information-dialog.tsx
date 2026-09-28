/**
 * File: passenger-info-dialog.tsx
 * Description: Main passenger information dialog that collects, validates, and saves passenger details.
 * It coordinates all customer information sections, manages form state, handles special travel requirements, and updates passenger data.
 */

"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, type Resolver, useForm, useFormState } from "react-hook-form";
import { useUnsavedChanges } from "@/components/common/unsaved-changes/unsaved-changes-dialog";
import { PassengerInformationDialogContent } from "@/components/customer-information/customer-information-modal/passenger-information-dialog-content/passenger-information-dialog-content";
import {
	isAnyCANADARoute,
	isAnyUSRoute,
	isDestinationThai,
	isDestinationUS,
	isUSDeparture,
} from "@/modules/utils/helpers/common/country-utils/country-utils";
import { setFocusOnInvalidInput } from "@/modules/utils/helpers/common/field-focus/field-focus";
import {
	emptyPassenger,
	getRoutesFromFlightSelection,
	mapFormToPassenger,
	mapPassengerToForm,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import {
	NON_CHARGEABLE_SSR_CODES,
	prepareSelectedServicesForPassenger,
} from "@/modules/utils/helpers/customer-information/prepared-selected-services-utils/prepare-selected-services-utils";
import {
	getFlightSegments,
	isNRTDirectOrRoundTrip,
} from "@/modules/utils/helpers/customer-information/travel-documents-utils/travel-documents-utils";
import {
	buildSinglePassengerSchema,
	type PassengerInformation,
	type PassengerType,
} from "@/modules/utils/validations/customer-information/customer-information-schema";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	updateAllPassengersAccommodation,
	updatePassenger,
} from "@/store/slices/customer-information/customer-information.slice";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import {
	selectConfirmedFlight,
	selectFlightSearchRequest,
} from "@/store/slices/flight-selection/flight-selection.slice";
import {
	addService,
	removeService,
	selectServicesByPassengerId,
} from "@/store/slices/passenger/passenger.slice";
import type { Passenger } from "@/types/customer-information/customer-information.types";

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Passenger Information Dialog component that coordinates all customer information sections, manages form state, handles special travel requirements, and updates passenger data.
 */
export function PassengerInformationDialog({
	passenger,
	passengerIndex,
	isPrimary,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: Readonly<{
	passenger: Passenger;
	passengerIndex: number;
	isPrimary: boolean;
	/** When provided the dialog is controlled externally; the trigger button is hidden. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}>) {
	const t = useTranslations("customer_information_page");
	const isControlled = controlledOpen !== undefined;
	const [internalOpen, setInternalOpen] = useState(false);
	const open = isControlled ? controlledOpen : internalOpen;
	const [visaPopupOpen, setVisaPopupOpen] = useState(false);
	const pendingFormData = useRef<PassengerInformation | null>(null);
	const dispatch = useAppDispatch();
	// get the passenger list from the Redux store
	const passengerValues = useAppSelector(selectPassengerList) as Passenger[];
	//get flight selection data from the Redux store
	const flightDetails = useAppSelector(selectConfirmedFlight);
	const flightSegments = flightDetails ? getFlightSegments(flightDetails) : [];
	//const flightDetails = confirmedFlight;
	// get the stored passenger from the Redux store based on the passenger id
	const storedPassenger = passengerValues.find((p) => p.id === passenger.id);
	const selectedPassengerServices = useAppSelector((state) =>
		selectServicesByPassengerId(state, passenger.id)
	);
	// Determine if the passenger information is completed based on Redux state
	const isCompleted = storedPassenger?.isCompleted ?? passenger.isCompleted ?? false;
	const flightRouteDetails = useAppSelector(selectFlightSearchRequest);
	const flightRoutes = flightRouteDetails ? getRoutesFromFlightSelection(flightRouteDetails) : [];
	// get the route information from the ConfirmedFlights to determine if the route is US, Canada or Thailand for validation purposes
	const hasUsRoute = isDestinationUS(flightRoutes);
	const hasThaiRoute = isDestinationThai(flightRoutes);
	const hasAnyUSRoute = isAnyUSRoute(flightRoutes);
	const hasUsCanadaRoute = hasAnyUSRoute || isAnyCANADARoute(flightRoutes);
	const hasUSDeparture = isUSDeparture(flightRoutes);
	// get the passenger type from the passengerTypeCode to determine which schema to use for validation
	const passengerType: PassengerType =
		(passenger.passengerTypeCode as PassengerType) ?? ("adult" as PassengerType);
	// to handle the copy to passenger functionality, we need to track if the user clicked the copy button. This is done using a ref so that it can be accessed in the onSubmit function without causing re-renders.
	const onClickCopyToPassengerRef = useRef(false);

	// Handler for the copy to passenger button click. Sets the ref to true so that the onSubmit function knows to copy the destination address to all passengers.
	function handleCopyToPassenger() {
		onClickCopyToPassengerRef.current = true;
	}
	// get the arrival and departure date time from the ConfirmedFlightPayload to pass to the schema builder for validation
	const arrivalDateTime =
		flightSegments?.at(0)?.scheduledDepartureArrivalDateTime?.arrivalDateTimeOffset ?? "";
	const departureDateTime =
		flightSegments?.at(0)?.scheduledDepartureArrivalDateTime?.departureDateTimeOffset ?? "";
	const lastFlightArrivalDate =
		flightSegments?.at(-1)?.scheduledDepartureArrivalDateTime?.arrivalDateTimeOffset ?? "";
	const schema = useMemo(
		() =>
			buildSinglePassengerSchema(
				t,
				passengerType,
				hasUsRoute,
				hasThaiRoute,
				hasUsCanadaRoute,
				hasAnyUSRoute,
				hasUSDeparture,
				departureDateTime,
				arrivalDateTime,
				lastFlightArrivalDate
			),

		[
			t,
			passengerType,
			hasUsRoute,
			hasThaiRoute,
			hasUsCanadaRoute,
			arrivalDateTime,
			departureDateTime,
			lastFlightArrivalDate,
			hasAnyUSRoute,
			hasUSDeparture,
		]
	);

	const form = useForm<PassengerInformation>({
		resolver: zodResolver(schema) as Resolver<PassengerInformation>,
		defaultValues: emptyPassenger,
		mode: "onBlur",
		reValidateMode: "onChange",
		shouldFocusError: false,
	});
	const { isDirty } = useFormState({ control: form.control });
	const allowDirtyCloseRef = useRef(false);
	const ignoreNextPopStateRef = useRef(false);
	const currentUrlRef = useRef("");
	const hasSyntheticHistoryEntryRef = useRef(false);

	const consumeSyntheticHistoryEntry = useCallback(() => {
		if (!hasSyntheticHistoryEntryRef.current) {
			return;
		}

		ignoreNextPopStateRef.current = true;
		hasSyntheticHistoryEntryRef.current = false;
		window.history.back();
	}, []);

	const discardUnsavedChanges = useCallback(() => {
		allowDirtyCloseRef.current = true;
		setVisaPopupOpen(false);
		consumeSyntheticHistoryEntry();
	}, [consumeSyntheticHistoryEntry]);

	const { showWarning } = useUnsavedChanges({
		description: t("unsaved_changes_description"),
		onDiscard: discardUnsavedChanges,
	});

	// Pre-fill form from Redux when the dialog opens.
	useEffect(() => {
		if (!open) {
			return;
		}

		const initialValues = storedPassenger ? mapPassengerToForm(storedPassenger) : emptyPassenger;
		form.reset(initialValues, {
			keepErrors: false,
			keepDirty: false,
			keepTouched: false,
			keepIsSubmitted: false,
			keepSubmitCount: false,
		});
	}, [open, storedPassenger, form]);

	useEffect(() => {
		if (!open) {
			allowDirtyCloseRef.current = false;
			ignoreNextPopStateRef.current = false;
			currentUrlRef.current = "";
			hasSyntheticHistoryEntryRef.current = false;
		}
	}, [open]);

	useEffect(() => {
		if (!open || isDirty || !hasSyntheticHistoryEntryRef.current) {
			return;
		}

		consumeSyntheticHistoryEntry();
	}, [open, isDirty, consumeSyntheticHistoryEntry]);

	const segments = flightRoutes;
	const isNRTRoute = isNRTDirectOrRoundTrip(segments);

	useEffect(() => {
		if (!open || !isDirty) {
			return;
		}

		const currentUrl = window.location.href;
		currentUrlRef.current = currentUrl;

		if (!hasSyntheticHistoryEntryRef.current) {
			window.history.pushState({ customerInformationDirtyDialog: true }, "", currentUrl);
			hasSyntheticHistoryEntryRef.current = true;
		}

		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};

		const handlePopState = () => {
			if (ignoreNextPopStateRef.current) {
				ignoreNextPopStateRef.current = false;
				return;
			}

			hasSyntheticHistoryEntryRef.current = false;

			const confirmed = window.confirm(t("unsaved_changes_description"));

			if (!confirmed) {
				hasSyntheticHistoryEntryRef.current = true;
				window.history.pushState(
					{ customerInformationDirtyDialog: true },
					"",
					currentUrlRef.current
				);
				return;
			}

			ignoreNextPopStateRef.current = true;
			discardUnsavedChanges();
			window.history.back();
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			window.removeEventListener("popstate", handlePopState);
		};
	}, [open, isDirty, t, discardUnsavedChanges]);

	/**
	 * Intercepts Dialog's own close events (X button, Escape, Cancel button,
	 * overlay click).
	 */
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && open && isDirty && !allowDirtyCloseRef.current) {
			showWarning();
			return;
		}
		if (isControlled) {
			controlledOnOpenChange?.(newOpen);
		}
		setInternalOpen(newOpen);
	};

	// ── Save helper ─────────────────────────────────────────────────────────────
	const executeSave = (formData: PassengerInformation, confirmedVisa = false) => {
		let isVisaPopupShown = false;
		if (confirmedVisa) {
			isVisaPopupShown = true;
		} else if (formData.nationality === "CHN") {
			isVisaPopupShown = storedPassenger?.isVisaPopupShown ?? false;
		}
		const passengerData: Passenger = {
			...mapFormToPassenger(formData, passenger),
			// Track VISA popup confirmation state per passenger
			isVisaPopupShown,
			isPrimaryPassenger: isPrimary,
		};

		// Build updated passenger values with all changes so copy-to-passenger behavior
		const updatedPassengerValues = (
			onClickCopyToPassengerRef.current
				? passengerValues.map((pax: Passenger) =>
						pax.id === passenger.id
							? passengerData
							: {
									...pax,
									apisInfo: {
										...pax.apisInfo,
										destinationAddress: {
											hotelName: formData.hotelName,
											countryOfStay: formData.countryOfStay,
											postalCode: formData.postalCode,
											city: formData.city,
											state: formData.state,
										},
									},
								}
					)
				: passengerValues.map((pax: Passenger) => (pax.id === passenger.id ? passengerData : pax))
		) as Passenger[];

		// Dispatch updates to Redux store
		if (!onClickCopyToPassengerRef.current) {
			dispatch(updatePassenger(passengerData));
		}

		if (onClickCopyToPassengerRef.current) {
			const { hotelName, countryOfStay, postalCode, city, state } = formData;
			dispatch(
				updateAllPassengersAccommodation({
					passengerId: passenger.id,
					passengerData: passengerData,
					destinationAddress: { hotelName, countryOfStay, postalCode, city, state },
				})
			);
			onClickCopyToPassengerRef.current = false;
		}

		// Keep passenger services in sync incrementally to avoid rebuilding all passengers.
		const currentPassengerValues =
			updatedPassengerValues.find((updatedPassenger) => updatedPassenger.id === passenger.id) ??
			passengerData;
		const preparedServicesForPassenger = prepareSelectedServicesForPassenger(
			currentPassengerValues,
			flightSegments
		);

		const existingNonChargeable = selectedPassengerServices.filter((s) =>
			NON_CHARGEABLE_SSR_CODES.has(s.ssrCode)
		);
		const toKey = (s: { ssrCode: string; chargeComment: string }) =>
			`${s.ssrCode}::${s.chargeComment}`;
		const compareKeys = (left: string, right: string) => left.localeCompare(right);
		const existingKeys = existingNonChargeable.map(toKey).sort(compareKeys).join("|");
		const preparedKeys = preparedServicesForPassenger.map(toKey).sort(compareKeys).join("|");
		const nonChargeableChanged = existingKeys !== preparedKeys;

		if (nonChargeableChanged) {
			for (const existingService of existingNonChargeable) {
				dispatch(
					removeService({
						passengerId: passenger.id,
						lfid: existingService.lfid,
						serviceID: existingService.serviceID,
						ssrCode: existingService.ssrCode,
					})
				);
			}

			for (const service of preparedServicesForPassenger) {
				const { passengerId: _pid, ...serviceWithoutPassengerId } = service;
				dispatch(
					addService({
						passengerId: passenger.id,
						lfid: service.lfid,
						serviceCategory: "non-chargeable",
						service: serviceWithoutPassengerId,
					})
				);
			}
		}

		// Close the dialog. After a successful save the form is reset (isDirty →
		// false) so no unsaved-changes warning can appear on subsequent opens.
		allowDirtyCloseRef.current = true;
		if (isControlled) {
			controlledOnOpenChange?.(false);
		} else {
			setInternalOpen(false);
		}
		consumeSyntheticHistoryEntry();
	};

	const onSubmit = (formData: PassengerInformation) => {
		const bodyWeight = formData.bodyWeight;
		if (bodyWeight === "Less than 9kg") {
			requestAnimationFrame(() => {
				setFocusOnInvalidInput();
			});
			return;
		}

		// ── VISA popup check (NRT route + Chinese nationality + no VISA doc) ────
		const isChinese = formData.nationality === "CHN";
		const hasVisaDoc = formData.hasTravelDocs === true && formData.documentType === "visa";
		const wasVisaPopupShown = storedPassenger?.isVisaPopupShown ?? false;

		if (isNRTRoute && isChinese && !hasVisaDoc && !wasVisaPopupShown) {
			pendingFormData.current = formData;
			setVisaPopupOpen(true);
			return; // Hold — wait for popup decision
		}

		executeSave(formData);
	};

	// ── VISA popup handlers ──────────────────────────────────────────────────
	const handleVisaEnterInfo = () => {
		setVisaPopupOpen(false);
		requestAnimationFrame(() => {
			document
				.getElementById("other-travel-documents")
				?.scrollIntoView({ behavior: "smooth", block: "start" });
		});
	};

	const handleVisaConfirmed = () => {
		setVisaPopupOpen(false);
		if (pendingFormData.current) {
			executeSave(pendingFormData.current, true);
			pendingFormData.current = null;
		}
	};

	const onInvalid = () => {
		// Defer until after React re-renders the DOM with data-invalid attributes
		// so all invalid fields (radio, combobox, input) are queryable.
		requestAnimationFrame(() => setFocusOnInvalidInput());
	};

	const handleSubmit = form.handleSubmit(onSubmit, onInvalid);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{!isControlled && (
				<DialogTrigger asChild>
					<Button variant="base" size="md" className="border-primary-700 px-4 text-primary-700">
						{isCompleted ? (
							<>
								<Icon name="edit" size={16} fill={0} wght={400} grad={0} opsz={20} />
								{t("button_edit_info")}
							</>
						) : (
							<>
								<Icon name="add" size={16} fill={0} wght={400} grad={0} opsz={20} />
								{t("button_add_info")}
							</>
						)}
					</Button>
				</DialogTrigger>
			)}

			{/* FormProvider makes useFormContext available inside the portaled DialogContent */}
			<FormProvider {...form}>
				<form onSubmit={handleSubmit} noValidate id={`pax-form-${passenger.id}`}>
					<PassengerInformationDialogContent
						passenger={passenger}
						passengerIndex={passengerIndex}
						isPrimary={isPrimary}
						isUsRoute={hasUsRoute}
						isThaiRoute={hasThaiRoute}
						onClickCopyToPassenger={handleCopyToPassenger}
					/>
				</form>
			</FormProvider>

			{/* ── VISA Confirmation Popup (NRT routes, Chinese nationality) ─── */}
			<Dialog open={visaPopupOpen} onOpenChange={setVisaPopupOpen}>
				<DialogContent
					gap={6}
					mobileOuterSpacing={16}
					onInteractOutside={(event) => event.preventDefault()}
					onEscapeKeyDown={(event) => event.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle className="text-2xl leading-9">{t("visa_dialog_title")}</DialogTitle>
					</DialogHeader>
					<p className="px-8 text-base-700 text-sm leading-6">{t("visa_dialog_description")}</p>
					<div className="flex flex-col gap-3 px-8 py-8 md:flex-row">
						<Button
							variant="primary"
							size="lg"
							className="h-auto flex-1 whitespace-normal py-3 text-center"
							onClick={handleVisaEnterInfo}
						>
							{t("button_enter_visa_information")}
						</Button>

						<Button
							variant="primary"
							outline
							size="lg"
							className="h-auto flex-1 whitespace-normal py-3 text-center"
							onClick={handleVisaConfirmed}
						>
							{t("button_confirmed_proceed_next_step")}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</Dialog>
	);
}
