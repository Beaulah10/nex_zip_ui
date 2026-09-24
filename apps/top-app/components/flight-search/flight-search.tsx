"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import { Field, FieldDescription, FieldError } from "@repo/ui/components/field";
import Icon from "@repo/ui/components/icon";
import { Input } from "@repo/ui/components/input";
import { RadioGroup, RadioGroupBorderedItem } from "@repo/ui/components/radio-group";
import { cn } from "@repo/ui/lib";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type MouseEvent, type ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import ArrivalModal from "@/components/flight-search/location/arrival-modal/arrival-modal";
import DepartureModal from "@/components/flight-search/location/departure-modal/departure-modal";
import {
	buildFlightSelectionPath,
	DEFAULT_PASSENGER_COUNTS,
	getDestinations,
	isConnectingFlightRoute,
	orderIataCodesByMessageAirports,
} from "@/modules/utils/helpers/flight-search/flight-search.helpers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetCalendarFares } from "@/store/slices/calendar-fares/calendar-fares.slice";
import { setFormData } from "@/store/slices/flight-search-form/flight-search-form.slice";
import {
	createFlightSearchSchema,
	getFlightSearchPassengerMessages,
} from "../../modules/utils/validations/flight-search";
import type { SeatType } from "../../types/flight-search/calendar.types";
import type {
	FlightDates,
	FlightSearchFormValues,
	MessageAirport,
	PassengerCounts,
	RouteGroups,
	TripType,
} from "../../types/flight-search/flight-search.types";
import CalendarModal from "./calendar/calendar";
import DateResetDialog from "./calendar/date-reset-modal/date-reset-dialog";
import AlertComponent from "./child-alert/alert";
import PaxModal from "./passenger/passenger-modal/passenger-modal";
import PassportInfoModal from "./passport/passport-info-modal";

/**
 * Determines passenger type based on passenger counts.
 * Returns "child" if any child passengers are present, otherwise "adult".
 *
 * @param passengerCounts - The current passenger counts
 * @returns Passenger type: "child" or "adult"
 */
function getPassengerType(passengerCounts: PassengerCounts): "adult" | "child" {
	const hasChildren = passengerCounts.childC > 0 || passengerCounts.infant > 0;
	return hasChildren ? "child" : "adult";
}

function normalizeTripTypeForUi(tripType: TripType): TripType {
	return tripType === "connecting-flight" ? "one-way" : tripType;
}

export default function FlightSearchPage({
	data,
	initialOrigin,
}: {
	data: RouteGroups;
	initialOrigin: string;
}): ReactElement {
	const dispatch = useAppDispatch();
	const persistedFormData = useAppSelector((state) => state.flightSearchForm.data);
	const t = useTranslations("flight_search_page");
	const locale = useLocale();
	const router = useRouter();
	const initialFormValues: FlightSearchFormValues = persistedFormData
		? {
				...persistedFormData,
				tripType: normalizeTripTypeForUi(persistedFormData.tripType),
			}
		: {
				tripType: "round-trip",
				origin: initialOrigin,
				destination: "",
				promotionCode: "",
				passengerCounts: DEFAULT_PASSENGER_COUNTS,
				travelDates: {
					outboundDate: "",
					returnDate: "",
				},
			};
	const [openPassportInfoModal, setOpenPassportInfoModal] = useState(false);
	const [openPaxModal, setOpenPaxModal] = useState(false);
	const [showPromoCode, setShowPromoCode] = useState(false);
	const [confirmedSeatType, setConfirmedSeatType] = useState<SeatType>("standard");
	const [openDateResetDialog, setOpenDateResetDialog] = useState(false);
	const [showSearchDetails, setShowSearchDetails] = useState(
		Boolean(initialFormValues.destination)
	);
	const previousRouteKeyRef = useRef<string | null>(null);
	const hasHydratedFromPersistedDraftRef = useRef(false);
	const pendingPassengerCountsRef = useRef<PassengerCounts | null>(null);
	const submittedFormDataRef = useRef<FlightSearchFormValues | null>(null);
	const flightSearchSchema = useMemo(() => createFlightSearchSchema(t), [t]);

	const form = useForm<FlightSearchFormValues>({
		resolver: zodResolver(flightSearchSchema),
		mode: "onSubmit",
		reValidateMode: "onChange",
		defaultValues: initialFormValues,
	});

	const tripType = useWatch({ control: form.control, name: "tripType" });
	const origin = useWatch({ control: form.control, name: "origin" });
	const destination = useWatch({ control: form.control, name: "destination" });
	const passengerCounts = useWatch({ control: form.control, name: "passengerCounts" });
	const airports = useMemo(() => t.raw("lists.airports") as MessageAirport[], [t]);

	const uniqueOrigins = useMemo(
		() =>
			orderIataCodesByMessageAirports(
				[...new Set(data.flatMap((group) => group.map((route) => route.origin)))],
				airports
			),
		[data, airports]
	);
	const uniqueDestinations = useMemo(
		() => orderIataCodesByMessageAirports(getDestinations(data, origin, tripType), airports),
		[data, origin, tripType, airports]
	);
	const routeKey = useMemo(
		() => `${origin ?? ""}|${destination ?? ""}|${tripType}`,
		[origin, destination, tripType]
	);
	const isReverseRouteValid = useMemo(
		() =>
			Boolean(
				origin && destination && getDestinations(data, destination, tripType).includes(origin)
			),
		[data, destination, origin, tripType]
	);
	const interChangeDisabled = !origin || !destination || !isReverseRouteValid;

	const resetCalendarSelection = () => {
		form.setValue(
			"travelDates",
			{
				outboundDate: "",
				returnDate: "",
			},
			{ shouldDirty: true }
		);
		setConfirmedSeatType("standard");
	};

	const handleExchange = (e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();

		if (interChangeDisabled) {
			return;
		}

		form.setValue("origin", destination, {
			shouldDirty: true,
		});
		form.setValue("destination", origin, {
			shouldDirty: true,
		});
		resetCalendarSelection();
		form.clearErrors(["origin", "destination"]);
	};

	const handleTripTypeChange = (nextTripType: TripType) => {
		if (tripType === nextTripType) {
			return;
		}

		if (tripType === "round-trip" && nextTripType === "one-way") {
			const currentDates = form.getValues("travelDates");
			form.setValue("travelDates", { ...currentDates, returnDate: "" }, { shouldDirty: true });
		}

		if (
			tripType === "one-way" &&
			nextTripType === "round-trip" &&
			origin !== "NRT" &&
			destination !== "NRT"
		) {
			form.setValue("destination", "", {
				shouldDirty: true,
			});
			form.setValue("travelDates", { outboundDate: "", returnDate: "" }, { shouldDirty: true });
			setConfirmedSeatType("standard");
			form.clearErrors("destination");
		}

		form.setValue("tripType", nextTripType, {
			shouldDirty: true,
		});
	};

	useEffect(() => {
		if (hasHydratedFromPersistedDraftRef.current) {
			return;
		}

		if (persistedFormData) {
			form.reset(
				{
					...persistedFormData,
					tripType: normalizeTripTypeForUi(persistedFormData.tripType),
				},
				{
					keepDefaultValues: false,
				}
			);
		}

		hasHydratedFromPersistedDraftRef.current = true;
	}, [form, persistedFormData]);

	useEffect(() => {
		if (previousRouteKeyRef.current === routeKey) {
			return;
		}

		dispatch(resetCalendarFares());
		previousRouteKeyRef.current = routeKey;
	}, [dispatch, routeKey]);

	const passengerMessages = getFlightSearchPassengerMessages(
		{
			origin,
			destination,
			passengerCounts,
		},
		t
	);
	const originError = form.formState.errors.origin;
	const destinationError = form.formState.errors.destination;

	useEffect(() => {
		if (destination) {
			setShowSearchDetails(true);
		}
	}, [destination]);

	/**
	 * Intercepts passenger count confirmations. If the currently confirmed dates
	 * were selected under the ZIP Full-Flat seat type and the new selection adds a
	 * child (2-6) or infant, the ZIP Full-Flat / child combination is invalid, so a
	 * confirmation dialog is shown before applying either change.
	 */
	const handlePassengerCountsChange = (nextValue: PassengerCounts) => {
		const hasChildSelection = nextValue.childC > 0 || nextValue.infant > 0;
		const hasConfirmedDates = Boolean(form.getValues("travelDates").outboundDate);

		if (confirmedSeatType === "zip" && hasChildSelection && hasConfirmedDates) {
			pendingPassengerCountsRef.current = nextValue;
			setOpenDateResetDialog(true);
			return;
		}

		form.setValue("passengerCounts", nextValue, { shouldDirty: true });
	};

	const handleDateResetConfirm = () => {
		if (pendingPassengerCountsRef.current) {
			form.setValue("passengerCounts", pendingPassengerCountsRef.current, { shouldDirty: true });
		}
		form.setValue("travelDates", { outboundDate: "", returnDate: "" }, { shouldDirty: true });
		setConfirmedSeatType("standard");
		pendingPassengerCountsRef.current = null;
		setOpenDateResetDialog(false);
	};

	const handleDateResetCancel = () => {
		form.setValue("passengerCounts", DEFAULT_PASSENGER_COUNTS, { shouldDirty: true });
		pendingPassengerCountsRef.current = null;
		setOpenDateResetDialog(false);
	};

	const handleSubmit = form.handleSubmit((values) => {
		// Automatically set tripType to "connecting-flight" if conditions are met
		const finalValues = { ...values };
		if (isConnectingFlightRoute(values.tripType, values.origin, values.destination)) {
			finalValues.tripType = "connecting-flight";
		}
		submittedFormDataRef.current = finalValues;

		dispatch(setFormData(finalValues));

		if (values.origin !== "SIN") {
			setOpenPassportInfoModal(true);
			return;
		}

		router.push(buildFlightSelectionPath(finalValues, locale));
	});

	const handlePassportNext = () => {
		const values = submittedFormDataRef.current ?? form.getValues();
		setOpenPassportInfoModal(false);
		router.push(buildFlightSelectionPath(values, locale));
	};

	return (
		<section className="w-full items-center justify-center bg-white px-4">
			<form
				onSubmit={handleSubmit}
				className="flex w-full max-w-6xl flex-col gap-6 rounded-[1rem] border border-base-200 bg-white px-4 py-6 md:p-6"
			>
				{/* ── Trip type ─────────────────────────────────────────── */}
				<Controller
					name="tripType"
					control={form.control}
					render={({ field }) => (
						<RadioGroup
							value={field.value}
							onValueChange={(value) => handleTripTypeChange(value as TripType)}
							className="flex gap-2"
						>
							<RadioGroupBorderedItem
								label="Round Trip"
								value="round-trip"
								className="flex-1 md:w-59 md:flex-none"
							/>
							<RadioGroupBorderedItem
								label="One Way"
								value="one-way"
								className="flex-1 md:w-59 md:flex-none"
							/>
						</RadioGroup>
					)}
				/>
				{/* ── Location row ──────────────────────────────────────── */}
				<div className="flex flex-col gap-2.5">
					<div className="flex w-full flex-col gap-2.5 md:flex-row">
						<Controller
							name="origin"
							control={form.control}
							render={({ field, fieldState }) => (
								<div className="flex flex-1 flex-col">
									<DepartureModal
										origin={origin}
										value={field.value}
										tripType={tripType}
										onClick={(value) => {
											if (value !== origin) {
												resetCalendarSelection();
											}
											if (destination && value !== origin) {
												form.setValue("destination", "", {
													shouldDirty: true,
												});
											}
											form.setValue("origin", value, {
												shouldDirty: true,
											});
											form.clearErrors(["origin", "destination"]);
										}}
										iata={uniqueOrigins}
									/>
									{fieldState.invalid && (
										<div className="mt-2.5 md:hidden">
											<FieldError errors={[fieldState.error]} />
										</div>
									)}
								</div>
							)}
						/>

						<button
							type="button"
							onClick={handleExchange}
							className={cn(
								"group flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-full border-0 bg-transparent p-0 leading-none hover:bg-transparent",
								!interChangeDisabled && "hover:cursor-pointer"
							)}
							aria-label="Swap origin and destination"
							disabled={interChangeDisabled}
						>
							<Icon
								name="sync_alt"
								size={24}
								color={!interChangeDisabled ? "text-primary-600" : "text-base-400"}
								className={cn(
									"block rotate-90 md:rotate-0",
									!interChangeDisabled && "group-hover:text-primary-800"
								)}
							/>
						</button>

						<Controller
							name="destination"
							control={form.control}
							render={({ field, fieldState }) => (
								<div className="flex flex-1 flex-col">
									<ArrivalModal
										origin={origin}
										tripType={tripType}
										onClick={(value) => {
											if (value !== destination) {
												resetCalendarSelection();
											}
											form.setValue("destination", value, {
												shouldDirty: true,
											});
											form.clearErrors(["origin", "destination"]);
										}}
										value={field.value}
										iata={uniqueDestinations}
									/>
									{fieldState.invalid && (
										<div className="mt-2.5 md:hidden">
											<FieldError errors={[fieldState.error]} />
										</div>
									)}
								</div>
							)}
						/>
					</div>

					{(originError || destinationError) && (
						<div className="hidden w-full gap-2.5 md:flex">
							<div className="flex-1">{originError && <FieldError errors={[originError]} />}</div>
							<div className="w-6"></div>
							<div className="flex-1">
								{destinationError && <FieldError errors={[destinationError]} />}
							</div>
						</div>
					)}
				</div>

				{showSearchDetails && (
					<div className="grid grid-cols-1 items-start gap-2 md:grid-cols-2 md:gap-4">
						<Controller
							name="passengerCounts"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field className="flex-1 gap-2 md:gap-2.5" data-invalid={fieldState.invalid}>
									<PaxModal
										open={openPaxModal}
										onOpenChange={setOpenPaxModal}
										value={field.value}
										onChange={handlePassengerCountsChange}
										origin={origin}
										destination={destination}
									/>
									{fieldState.invalid && (origin === "YVR" || destination === "YVR") && (
										<FieldError errors={passengerMessages.map((message) => ({ message }))} />
									)}
								</Field>
							)}
						/>

						<Controller
							name="travelDates"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field className="flex-1 gap-2 md:gap-2.5" data-invalid={fieldState.invalid}>
									<CalendarModal
										tripType={tripType}
										outboundDate={field.value.outboundDate}
										returnDate={field.value.returnDate}
										onChange={(value: FlightDates) => field.onChange(value)}
										origin={origin}
										destination={destination}
										promotionCode={form.getValues("promotionCode")}
										passengerType={getPassengerType(passengerCounts)}
										disabled={!destination}
										onSeatTypeConfirm={setConfirmedSeatType}
										confirmedSeatType={confirmedSeatType}
									/>
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							)}
						/>
					</div>
				)}

				{/* ── Promotion code ────────────────────────────────────── */}
				{showPromoCode ? (
					<Controller
						name="promotionCode"
						control={form.control}
						render={({ field, fieldState }) => (
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<Field className="gap-2" data-invalid={fieldState.invalid}>
									<FieldDescription className="text-brand-japan-black">
										Enter promotion code
									</FieldDescription>
									<Input {...field} value={field.value ?? ""} placeholder="Promotion Code" />
									{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
								</Field>
							</div>
						)}
					/>
				) : (
					<div className="flex w-full">
						<button
							type="button"
							className="flex w-fit cursor-pointer items-center gap-2"
							onClick={() => setShowPromoCode((prev) => !prev)}
						>
							<Icon name="add" size={18} color="" className="text-primary-700" />
							<span className="font-medium text-base text-primary-700 leading-6 hover:underline">
								{t("label_promocode")}
							</span>
						</button>
					</div>
				)}

				{/* ── Notice alert ──────────────────────────────────────── */}
				{passengerCounts.infant > 0 && <AlertComponent />}
				{/* ── Search button ─────────────────────────────────────── */}
				<div className="flex justify-end">
					<Button
						color="primary"
						size="xl"
						className="w-full bg-primary-600 text-white md:w-auto md:min-w-64"
					>
						{t("label_search")}
					</Button>
					<PassportInfoModal
						{...{ openPassportInfoModal, setOpenPassportInfoModal }}
						onNext={handlePassportNext}
					/>
				</div>
			</form>
			<DateResetDialog
				open={openDateResetDialog}
				onConfirm={handleDateResetConfirm}
				onCancel={handleDateResetCancel}
			/>
		</section>
	);
}
