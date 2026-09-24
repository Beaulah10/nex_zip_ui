/**
 * File: confirmation-passenger.ts
 * Description: Builds passenger confirmation details, ancillary summary rows, pricing totals,
 * and associated adult/dependent service information.
 */

import { BAGGAGE_CATEGORY_MAP } from "@/modules/utils/constants/baggage-service/baggage-selection-constants";
import {
	BUNDLE_CODES,
	NO_BUNDLE_ID,
	ZIP_FULL_FLAT_CABIN_CODE,
} from "@/modules/utils/constants/bundle/bundle.constants";
import { WARNING_MODES } from "@/modules/utils/constants/confirmation/confirmation.constants";
import {
	CONFIRMATION_SUMMARY_ROW_ICONS,
	CONFIRMATION_SUMMARY_ROW_IDS,
} from "@/modules/utils/constants/confirmation/summary-row.constants";
import { SPECIAL_ASSISTANCE_SSR_CODES } from "@/modules/utils/constants/customer-information/constants";
import {
	buildBaggageCategories,
	mapBaggageCategories,
} from "@/modules/utils/helpers/baggage-service/baggage-categories/baggage-categories";
import { getBundleName } from "@/modules/utils/helpers/bundle/bundle.helpers";
import { isBundleSeatEligible } from "@/modules/utils/helpers/seat-map/seat-map-passenger-panel/seat-map-passenger-panel";
import type {
	BaggageTranslator,
	PassengerBaggageServices,
	ServicePassenger,
} from "@/types/baggage-selection/baggage-selection.types";
import type {
	ConfirmationPassengerDeadlineState,
	ConfirmationPassengerDisplay,
	ConfirmationPassengerServiceDeadlineState,
	ConfirmationPurchaseDeadlineServiceKey,
	PassengerInformationRow,
	StandardAncillarySummaryRowId,
	SummaryItemGroup,
	SummaryRowData,
} from "@/types/confirmation/confirmation.types";
import type { Passenger } from "@/types/customer-information/customer-information.types";
import type { FareInfo } from "@/types/flight-selection/flight-selection.types";
import type {
	BundleCode,
	PassengerBundle,
	PassengerSeat,
	PassengerService,
	PassengerValues,
} from "@/types/passenger/passenger.type";

export type SummaryLabels = {
	bundleLabel: string;
	bundleUnavailableForAssociatedDependentNote: string;
	priorityAssociatedDependentIncludedNote: string;
	infantAssociatedDependentIncludedNote: string;
	seatTypeLabel: string;
	seatLabel: string;
	baggageLabel: string;
	mealLabel: string;
	priorityServicesLabel: string;
	airportLoungeLabel: string;
	transportServicesLabel: string;
	ancillaryOptionalServicesLabel: string;
	flightChangeVoucherLabel: string;
	selectedLabel: string;
	addLabel: string;
	changeLabel: string;
	standardSeatTypeLabel: string;
	zipFullFlatSeatTypeLabel: string;
	baggageTranslate: BaggageTranslator;
	seatTypeNote: string;
	seatIncludedInBundleNote: string;
	notSelectedLabel: string;
	buildDeadlineSelectWarning: (serviceLabel: string) => string;
	buildDeadlineChangeWarning: (serviceLabel: string) => string;
	carryOnBaggage7kgLabel: string;
};

/**
 * Formats date input from either split fields or a raw string into the
 * single human-readable date format used in confirmation summaries.
 */
function formatDatePart(datePart?: { year: string; month: string; day: string } | string): string {
	if (!datePart) return "";
	if (typeof datePart === "string") return datePart;
	const { year, month, day } = datePart;
	if (!year || !month || !day) return "";
	const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		timeZone: "UTC",
	});
}

/**
 * Formats passenger names for confirmation surfaces using last-name-first order.
 */
function formatPassengerDisplayName(
	passenger: Pick<PassengerValues, "id" | "firstName" | "middleName" | "lastName">
): string {
	return (
		[passenger.lastName, passenger.firstName, passenger.middleName]
			.filter(Boolean)
			.join(" ")
			.toUpperCase() || passenger.id
	);
}

/**
 * Returns the age badge label used in the confirmation passenger accordion.
 * Only non-adult passenger types produce a visible badge.
 */
export function getPassengerAgeBadge(passengerType?: string): string | undefined {
	switch (passengerType?.toLowerCase()) {
		case "infant":
		case "inf":
			return "0 - 1 year";
		case "childc":
			return "2 - 6 years";
		case "childb":
			return "7 - 11 years";
		case "childa":
		case "chd":
			return "12 - 14 years";
		default:
			return undefined;
	}
}

/**
 * Decides whether a summary row should show Add or Change.
 * Rows with an existing selection get Change; empty rows get Add.
 */
function getSummaryActionLabel(hasSelection: boolean, labels: SummaryLabels): string {
	return hasSelection ? labels.changeLabel : labels.addLabel;
}

function getPassengerDeadlineStateForService({
	passengerDeadlineState,
	segmentLfids,
	serviceKey,
}: {
	passengerDeadlineState?: ConfirmationPassengerDeadlineState;
	segmentLfids?: ReadonlySet<number>;
	serviceKey: ConfirmationPurchaseDeadlineServiceKey;
}): ConfirmationPassengerServiceDeadlineState | undefined {
	if (!passengerDeadlineState || !segmentLfids || segmentLfids.size === 0) {
		return undefined;
	}

	for (const segmentLfid of segmentLfids) {
		const state = passengerDeadlineState[segmentLfid]?.[serviceKey];

		if (state) {
			return state;
		}
	}

	return undefined;
}

function getDeadlineWarningMessage(
	state: ConfirmationPassengerServiceDeadlineState | undefined,
	serviceLabel: string,
	labels: SummaryLabels
): string | undefined {
	if (!state) {
		return undefined;
	}

	return state.warningMode === WARNING_MODES.CANNOT_CHANGE
		? labels.buildDeadlineChangeWarning(serviceLabel)
		: labels.buildDeadlineSelectWarning(serviceLabel);
}
/**
 * Determines whether the passenger has selected any baggage.
 * Returns false if no baggage is selected, true otherwise.
 */
const getBaggageSelection = (
	baggageGroups: SummaryItemGroup[],
	carryonLabel7kg: string,
	notSelectedLabel: string
) => {
	if (baggageGroups?.length === 0) {
		return false;
	}
	if (baggageGroups?.length <= 2) {
		const carryOnSelection = baggageGroups[0]?.items?.[0]?.label;
		const checkInSelection = baggageGroups[1]?.items?.[0]?.label;
		const isNotSelected =
			carryOnSelection === carryonLabel7kg && checkInSelection === notSelectedLabel;
		return !isNotSelected;
	} else {
		return true;
	}
};
/**
 * Normalizes adult passenger type codes used across store and API data.
 * This keeps linked-passenger rules consistent for adults in confirmation.
 */
function isAdultPassengerType(passengerTypeCode?: string): boolean {
	const normalizedType = passengerTypeCode?.toLowerCase();
	return normalizedType === "adult" || normalizedType === "adt";
}

/**
 * Detects the dependent passenger types that follow priority-service association rules.
 * ChildC and infant passengers share the same priority confirmation restrictions.
 */
function isAssociatedPriorityDependentPassengerType(passengerTypeCode?: string): boolean {
	const normalizedType = passengerTypeCode?.toLowerCase();
	return normalizedType === "childc" || normalizedType === "infant" || normalizedType === "inf";
}

function isAssociatedInfantPassengerType(passengerTypeCode?: string): boolean {
	const normalizedType = passengerTypeCode?.toLowerCase();
	return normalizedType === "infant" || normalizedType === "inf";
}

function isInfantPassengerType(passengerTypeCode?: string): boolean {
	const normalizedType = passengerTypeCode?.toLowerCase();
	return normalizedType === "infant" || normalizedType === "inf";
}

/**
 * Determines whether bundle restrictions should apply to this passenger.
 * The rule applies only to linked dependents in confirmation.
 */
function isRestrictedAssociatedPassenger(
	passengerDetail: Passenger,
	passengerTypeCode: string | undefined
): boolean {
	if (isAssociatedPriorityDependentPassengerType(passengerTypeCode)) {
		return (
			passengerDetail.hasAccompanyingAdult === true &&
			Boolean(passengerDetail.associateWithPassengerId)
		);
	}

	return false;
}

/**
 * Checks whether an adult passenger has a linked childC or infant.
 * That association drives adult-only confirmation adjustments such as free seats.
 */
function hasAssociatedChildOrInfantForAdult(
	passengerDetail: Passenger,
	passengerDetailsList: Passenger[],
	passengerValuesById: Map<string, PassengerValues>
): boolean {
	return passengerDetailsList.some((passenger) => {
		const linkedPassengerType =
			passenger.passengerTypeCode ?? passengerValuesById.get(passenger.id)?.passengerTypeCode;

		return (
			isAssociatedPriorityDependentPassengerType(linkedPassengerType) &&
			passenger.hasAccompanyingAdult === true &&
			passenger.associateWithPassengerId === passengerDetail.id
		);
	});
}

/**
 * Creates a one-line placeholder item for rows with no purchase or selection.
 * The summary card consumes this same shape for normal and fallback states.
 */
function buildPlaceholderItems(label: string): { label: string }[] {
	return [{ label }];
}

/**
 * Maps ancillary service records into confirmation row items.
 * Each item keeps the display label and amount needed by the summary UI.
 */
function getServiceApplicableAmount(service: PassengerService): number {
	return service.applicableAmount ?? service.amount;
}

/**
 * Maps ancillary service records into confirmation row items.
 * When requested, bundled items render their original amount struck through,
 * with the effective applicable amount shown as the chargeable price.
 */
function mapServicesToItems(
	services: PassengerService[],
	labels: SummaryLabels,
	options?: { showBundleNote?: boolean }
): SummaryRowData["groups"][number]["items"] {
	return services
		.filter((service) => service.description || service.ssrCode)
		.map((service) => {
			const applicableAmount = getServiceApplicableAmount(service);
			const hasReducedApplicableAmount = service.amount > applicableAmount;

			return {
				label: service.description || service.ssrCode,
				price: applicableAmount,
				originalPrice: hasReducedApplicableAmount ? service.amount : undefined,
				note:
					hasReducedApplicableAmount && options?.showBundleNote
						? labels.seatIncludedInBundleNote
						: undefined,
			};
		});
}

type PlaceholderSummaryItem = { label: string; note?: string };
type AssociatedServiceKey = "express" | "lounge" | "travel";

type BaggageSummarySource = {
	originalAmount: number;
	applicableAmount: number;
};

/**
 * Aggregates baggage services by the same categories used in the confirmation UI,
 * while preserving both original and applicable totals from the Redux store.
 */
function buildBaggageSummarySources(services: PassengerService[]): {
	carryOn: BaggageSummarySource[];
	checkedIn: BaggageSummarySource[];
	sportsEquipment: BaggageSummarySource[];
} {
	const aggregateBySsrCode = (items: PassengerService[]) => {
		const totalsBySsrCode = new Map<string, BaggageSummarySource>();

		for (const service of items) {
			const current = totalsBySsrCode.get(service.ssrCode);
			const applicableAmount = getServiceApplicableAmount(service);

			if (current) {
				current.originalAmount += service.amount;
				current.applicableAmount += applicableAmount;
				continue;
			}

			totalsBySsrCode.set(service.ssrCode, {
				originalAmount: service.amount,
				applicableAmount,
			});
		}

		return Array.from(totalsBySsrCode.values());
	};

	return {
		carryOn: aggregateBySsrCode(
			services.filter((service) => service.categoryId === BAGGAGE_CATEGORY_MAP.CARRY_ON)
		),
		checkedIn: aggregateBySsrCode(
			services.filter(
				(service) =>
					service.categoryId === BAGGAGE_CATEGORY_MAP.CHECKED_IN && service.ssrCode === "BAGN"
			)
		),
		sportsEquipment: aggregateBySsrCode(
			services.filter((service) => service.categoryId === BAGGAGE_CATEGORY_MAP.SPORTS)
		),
	};
}

/**
 * Clones associated-adult services into read-only placeholder items and appends
 * the guidance note used for dependent passengers.
 */
function mapAssociatedPlaceholderItems(
	services: PassengerService[],
	note: string
): PlaceholderSummaryItem[] {
	let hasAttachedNote = false;

	return services
		.filter((service) => service.description || service.ssrCode)
		.map((service) => {
			const item: PlaceholderSummaryItem = {
				label: service.description || service.ssrCode,
			};

			if (!hasAttachedNote) {
				item.note = note;
				hasAttachedNote = true;
			}

			return item;
		});
}

/**
 * Resolves the linked adult id from either customer-information state or the
 * saved passenger selection state, since confirmation may receive either source.
 */
function getAssociatedAdultId(passengerDetail: Passenger, passengerData?: PassengerValues): string {
	return (
		passengerDetail.associateWithPassengerId?.trim() ??
		passengerData?.associateWithPassengerId?.trim() ??
		""
	);
}

/**
 * Normalizes whether the passenger should be treated as associated with an adult
 * even when only the saved passenger selection state contains the mapping.
 */
function hasAssociatedAdult(passengerDetail: Passenger, passengerData?: PassengerValues): boolean {
	return (
		passengerDetail.hasAccompanyingAdult === true ||
		Boolean(getAssociatedAdultId(passengerDetail, passengerData))
	);
}

/**
 * Builds a minimal passenger object used when a linked adult cannot be loaded
 * from saved passenger values.
 */
function createFallbackAssociatedAdult(associatedAdultId: string): PassengerValues {
	return {
		id: associatedAdultId,
		passengerTypeCode: "adult",
		firstName: "",
		lastName: "",
	};
}

/**
 * Returns a linked adult's scoped service selections for the requested category.
 * Dependents can optionally prefer their own stored services or inherit only when empty.
 */
function getAssociatedDependentServices(
	isAssociatedDependentPassenger: boolean,
	passengerServices: PassengerService[],
	params: {
		serviceKey: AssociatedServiceKey;
		associatedAdultId: string;
		passengerValuesById: Map<string, PassengerValues>;
		segmentLfids?: ReadonlySet<number>;
		requirePassengerServicesEmpty?: boolean;
	}
): PassengerService[] {
	if (!isAssociatedDependentPassenger || !params.associatedAdultId) {
		return [];
	}

	if (params.requirePassengerServicesEmpty) {
		if (passengerServices.length > 0) {
			return [];
		}
	} else if (passengerServices.length > 0) {
		return passengerServices;
	}

	const associatedAdult = filterPassengerAncillariesByLfid(
		params.passengerValuesById.get(params.associatedAdultId) ??
			createFallbackAssociatedAdult(params.associatedAdultId),
		params.segmentLfids
	);

	return associatedAdult.services?.[params.serviceKey] ?? [];
}

/**
 * Translates stored bundle selections into summary items for confirmation.
 * No Bundle stays label-only while paid bundles retain their price values.
 */
function mapBundlesToItems(bundles: PassengerBundle[]): Array<{ label: string; price?: number }> {
	return bundles.map((bundle) => {
		const label = getBundleName(bundle.bundleCode as BundleCode);
		const amount = bundle.amount ?? bundle.bundleCategory?.amount ?? 0;

		if (bundle.bundleCode === NO_BUNDLE_ID) {
			return { label };
		}

		return {
			label,
			price: amount,
		};
	});
}

/**
 * Detects whether the current scoped passenger bundle selection contains Flex Biz.
 * Confirmation uses this to conditionally show the voucher summary row.
 */
function hasFlexBizBundleSelection(bundles: PassengerBundle[]): boolean {
	return bundles.some((bundle) => BUNDLE_CODES.FLEX_BIZ.includes(bundle.bundleCode));
}

/**
 * Resolves the display name used for the selected seat type row.
 * ZIP Full-Flat is handled separately from the standard cabin label.
 */
function getSeatTypeDisplayName(serviceCode: string, labels: SummaryLabels): string {
	return serviceCode === "STZF" ? labels.zipFullFlatSeatTypeLabel : labels.standardSeatTypeLabel;
}
/**
 * Resolves the seat-type row label from the selected seat first, then the
 * booked cabin when no seat has been chosen yet.
 */
function getSeatTypeRowLabel({
	seatServiceCode,
	cabin,
	labels,
}: {
	seatServiceCode?: string;
	cabin?: string;
	labels: SummaryLabels;
}): string | undefined {
	if (seatServiceCode) {
		return getSeatTypeDisplayName(seatServiceCode, labels);
	}

	if (!cabin) {
		return undefined;
	}

	return cabin.toUpperCase() === ZIP_FULL_FLAT_CABIN_CODE
		? labels.zipFullFlatSeatTypeLabel
		: labels.standardSeatTypeLabel;
}

/**
 * Finds the bundle code related to a selected seat for the same segment.
 * This allows confirmation to decide whether the seat price is bundled.
 */
function getSeatBundleCode(passenger: PassengerValues, seat: PassengerSeat): string | undefined {
	return (
		seat.bundleCode || passenger.bundles?.find((bundle) => bundle.lfid === seat.lfid)?.bundleCode
	);
}

/**
 * Checks whether a seat should be displayed as included in a bundle.
 * The result is used for both pricing and the bundle note in confirmation.
 */
function isSeatIncludedInBundle(passenger: PassengerValues, seat: PassengerSeat): boolean {
	return isBundleSeatEligible(getSeatBundleCode(passenger, seat));
}

/**
 * Resolves the passenger fare amount for the selected seat type row.
 * Prefers fareDetails because they store the per-passenger cabin fare.
 */
function getPassengerFareAmount(
	fareInfo: FareInfo | undefined,
	passengerTypeCode: string | undefined
): number | undefined {
	const normalizedPassengerType = passengerTypeCode?.toLowerCase();
	if (!normalizedPassengerType) {
		return undefined;
	}

	const matchedFareDetail = fareInfo?.fareDetails?.find(
		(fareDetail) => fareDetail.passengerType?.toLowerCase() === normalizedPassengerType
	);
	if (matchedFareDetail) {
		return matchedFareDetail.fareAmt;
	}

	return fareInfo?.boundSummary?.passengerWiseFares?.find(
		(passengerFare) => passengerFare.passengerType?.toLowerCase() === normalizedPassengerType
	)?.amount;
}

/**
 * Resolves the seat amount that should be charged in confirmation.
 * Prefer the persisted Redux `applicableAmount` and only fall back to local rules
 * when older seat data does not include that field.
 */
function getSeatApplicableAmount(
	passenger: PassengerValues,
	seat: PassengerSeat,
	options?: { forceAssociatedAdultSeatPriceToZero?: boolean }
): number {
	if (seat.applicableAmount !== undefined) {
		return seat.applicableAmount;
	}

	if (
		isSeatIncludedInBundle(passenger, seat) ||
		options?.forceAssociatedAdultSeatPriceToZero === true
	) {
		return 0;
	}

	return seat.amount;
}

/**
 * Converts stored seat selections into summary-row items for display.
 * It also handles zero-price cases for bundled seats and linked-adult seats.
 */
function mapSeatsToItems(
	passenger: PassengerValues,
	labels: SummaryLabels,
	options?: { forceAssociatedAdultSeatPriceToZero?: boolean }
): SummaryRowData["groups"][number]["items"] {
	return (passenger.seats ?? []).map((seat) => {
		const label = `${seat.row}${seat.column}`;
		const applicableAmount = getSeatApplicableAmount(passenger, seat, options);
		const isBundleIncludedSeat = isSeatIncludedInBundle(passenger, seat);

		if (applicableAmount === seat.amount) {
			return {
				label,
				price: applicableAmount,
			};
		}

		return {
			label,
			price: applicableAmount,
			originalPrice: seat.amount > applicableAmount ? seat.amount : undefined,
			note: isBundleIncludedSeat ? labels.seatIncludedInBundleNote : undefined,
		};
	});
}

/**
 * Builds the passenger shape expected by the shared baggage helpers.
 * Confirmation only needs a subset of fields for baggage group generation.
 */
function buildPassengerServicePassenger(passenger: PassengerValues): ServicePassenger {
	return {
		id: passenger.id,
		name: passenger.id,
		bundleCode: passenger.bundles?.[0]?.bundleCode ?? "NOBN",
		bundleLabel: "",
		mealfeatures: [],
		baggagefeatures: [],
		passengerTypeCode: passenger.passengerTypeCode,
		isIcnRoute: false,
		isValueBundle: false,
	};
}

/**
 * Groups baggage services into carry-on, checked, and sports collections.
 * Repeated baggage selections are merged so the summary can show quantities.
 */
function buildPassengerBaggageServices(services: PassengerService[]): PassengerBaggageServices {
	const baggageServices: PassengerBaggageServices = {
		carryOn: {},
		checkedIn: {},
		sportsEquipment: {},
	};
	for (const service of services) {
		switch (service.categoryId) {
			case BAGGAGE_CATEGORY_MAP.CARRY_ON:
				baggageServices.carryOn[service.ssrCode] = { ...service };
				break;
			case BAGGAGE_CATEGORY_MAP.CHECKED_IN: {
				const existing = baggageServices.checkedIn[service.ssrCode];
				if (existing) {
					baggageServices.checkedIn[service.ssrCode] = {
						service: {
							...existing.service,
							amount: service.amount,
						},
						quantity: existing.quantity + 1,
					};
				} else {
					baggageServices.checkedIn[service.ssrCode] = {
						service: { ...service },
						quantity: 1,
					};
				}
				break;
			}
			case BAGGAGE_CATEGORY_MAP.SPORTS: {
				const existing = baggageServices.sportsEquipment[service.ssrCode];
				if (existing) {
					baggageServices.sportsEquipment[service.ssrCode] = {
						service: {
							...existing.service,
							amount: service.amount,
						},
						quantity: existing.quantity + 1,
					};
				} else {
					baggageServices.sportsEquipment[service.ssrCode] = {
						service: { ...service },
						quantity: 1,
					};
				}
				break;
			}
		}
	}

	return baggageServices;
}
type BaggageCategory = ReturnType<typeof buildBaggageCategories>[number];
/**
 * Uses the shared baggage helpers to build titled confirmation row groups.
 * The returned structure matches what the passenger summary card renders.
 */
function mapBaggageToGroups(
	passenger: PassengerValues,
	labels: SummaryLabels
): SummaryRowData["groups"] | undefined {
	const baggageServices = passenger.services?.baggage ?? [];
	const selectedBundle = passenger.bundles?.[0]?.bundleCode;
	const t = labels.baggageTranslate;
	const mappedCategories = mapBaggageCategories({
		categories: buildBaggageCategories({
			passenger: buildPassengerServicePassenger(passenger),
			baggageServices: buildPassengerBaggageServices(baggageServices),
		}),
		t,
	});
	const baggageSummarySources = buildBaggageSummarySources(baggageServices);
	const carryOnTitle = t("passenger_list_carry_on_baggage");
	const checkedInTitle = t("passenger_list_checked_in_baggage");
	const sportsEquipmentTitle = t("passenger_list_sports_equipment");
	const notSelectedLabel = labels.notSelectedLabel;
	const bundleNoteLabel = labels.seatIncludedInBundleNote;
	const carryOnCategory = mappedCategories?.find((category) => category.title === carryOnTitle);
	const checkedInCategory = mappedCategories?.find((category) => category.title === checkedInTitle);
	const sportsEquipmentCategory = mappedCategories?.find(
		(category) => category.title === sportsEquipmentTitle
	);
	const groups: NonNullable<SummaryRowData["groups"]> = [
		carryOnCategory?.items.length
			? mapCategoryItems(
					carryOnCategory,
					baggageSummarySources.carryOn,
					bundleNoteLabel,
					selectedBundle
				)
			: baggageNotSelectedGroup(carryOnTitle, notSelectedLabel),

		checkedInCategory?.items.length
			? mapCategoryItems(
					checkedInCategory,
					baggageSummarySources.checkedIn,
					bundleNoteLabel,
					selectedBundle
				)
			: baggageNotSelectedGroup(checkedInTitle, notSelectedLabel),
	];
	if (sportsEquipmentCategory?.items.length) {
		groups.push(
			mapCategoryItems(
				sportsEquipmentCategory,
				baggageSummarySources.sportsEquipment,
				bundleNoteLabel,
				selectedBundle
			)
		);
	}
	return groups;
}
/**
 * Maps a baggage category's items to summary row items, including pricing and bundle notes.
 * param category : The baggage category containing items to map, sourceItems: The corresponding summary source items for pricing. noteLabel: The label to display for bundle notes.selectedBundle: The currently selected bundle code, if any.
 * returns An object containing the mapped summary row items.
 */
const mapCategoryItems = (
	category: BaggageCategory,
	sourceItems: BaggageSummarySource[],
	noteLabel: string,
	selectedBundle?: string
) => ({
	items: category.items.map((item, index) => {
		const sourceItem = sourceItems[index];
		const applicableAmount = sourceItem?.applicableAmount ?? item.price;

		const originalPrice =
			sourceItem?.originalAmount != null && sourceItem.originalAmount > applicableAmount
				? sourceItem.originalAmount
				: undefined;
		const bundleSelected = selectedBundle && selectedBundle !== "NOBN";
		return {
			title: index === 0 ? category.title : undefined,
			label: item.label,
			price: applicableAmount,
			originalPrice,
			note: applicableAmount === 0 && bundleSelected ? noteLabel : undefined,
			hideOriginalPrice: true,
		};
	}),
});
/**
 * Creates a summary item group for baggage that has not been selected.
 * param title: The title to display for the group. label: The label to display for the not selected baggage item.
 * returns A summary item group indicating that no baggage has been selected.
 */
const baggageNotSelectedGroup = (title: string, label: string): SummaryItemGroup => {
	return {
		items: [
			{
				title,
				label: label,
				hideOriginalPrice: true,
			},
		],
	};
};
/**
 * Filters passenger ancillaries down to only the active segment set.
 * This keeps each confirmation leg card scoped to its own selections.
 */

function filterPassengerAncillariesByLfid(
	passenger: PassengerValues,
	segmentLfids?: ReadonlySet<number>
): PassengerValues {
	if (!segmentLfids || segmentLfids.size === 0) {
		return passenger;
	}

	const filterByLfid = <T extends { lfid: number }>(items?: T[]) =>
		items?.filter((item) => segmentLfids.has(item.lfid));

	return {
		...passenger,
		bundles: filterByLfid(passenger.bundles),
		seats: filterByLfid(passenger.seats),
		services: passenger.services
			? {
					baggage: filterByLfid(passenger.services.baggage),
					meals: filterByLfid(passenger.services.meals),
					express: filterByLfid(passenger.services.express),
					lounge: filterByLfid(passenger.services.lounge),
					travel: filterByLfid(passenger.services.travel),
					extras: filterByLfid(passenger.services.extras),
					"non-chargeable": filterByLfid(passenger.services["non-chargeable"]),
				}
			: undefined,
	};
}

/**
 * Builds the passenger summary rows shown inside the confirmation accordion.
 * Maps bundles, seats, baggage, and ancillary services into row groups.
 */
export function getPassengerSummaryRows(
	passenger: PassengerValues,
	labels: SummaryLabels,
	options?: {
		segmentLfids?: ReadonlySet<number>;
		passengerDeadlineState?: ConfirmationPassengerDeadlineState;
		forceNoBundleWithAssociatedDependentNote?: boolean;
		forceAssociatedAdultSeatPriceToZero?: boolean;
		hideAssociatedPriorityServiceAddButton?: boolean;
		hideAssociatedInfantServiceAddButton?: boolean;
		seatTypePrice?: number;
		seatTypeCabin?: string;
		associatedPriorityPlaceholderServices?: PassengerService[];
		isAirportLoungeRouteEnabled?: boolean;
		associatedAirportLoungePlaceholderServices?: PassengerService[];
		isTransportServiceRouteEnabled?: boolean;
		associatedTransportPlaceholderServices?: PassengerService[];
	}
): SummaryRowData[] {
	const rows: SummaryRowData[] = [];
	const forceNoBundleWithAssociatedDependentNote =
		options?.forceNoBundleWithAssociatedDependentNote === true;
	const isAirportLoungeRouteEnabled = options?.isAirportLoungeRouteEnabled !== false;
	const isTransportServiceRouteEnabled = options?.isTransportServiceRouteEnabled !== false;
	const hideAssociatedPriorityEmptyAction =
		options?.hideAssociatedPriorityServiceAddButton === true;
	const hideAssociatedInfantEmptyAction = options?.hideAssociatedInfantServiceAddButton === true;
	const bundleDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "bundle",
	});
	const seatDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "seat",
	});
	const baggageDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "baggage",
	});
	const mealDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "meal",
	});
	const priorityDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "priority",
	});
	const loungeDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "lounge",
	});
	const transportDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "transport",
	});
	const extrasDeadlineState = getPassengerDeadlineStateForService({
		passengerDeadlineState: options?.passengerDeadlineState,
		segmentLfids: options?.segmentLfids,
		serviceKey: "extras",
	});

	const bundleItems = mapBundlesToItems(passenger.bundles ?? []);
	rows.push({
		id: CONFIRMATION_SUMMARY_ROW_IDS.bundle,
		icon: CONFIRMATION_SUMMARY_ROW_ICONS.bundle,
		label: labels.bundleLabel,
		groups: [
			{
				items: forceNoBundleWithAssociatedDependentNote
					? [
							{
								label: getBundleName(NO_BUNDLE_ID as BundleCode),
								note: labels.bundleUnavailableForAssociatedDependentNote,
							},
						]
					: bundleItems.length
						? bundleItems
						: [{ label: getBundleName(NO_BUNDLE_ID as BundleCode) }],
			},
		],
		warningMessage: getDeadlineWarningMessage(bundleDeadlineState, labels.bundleLabel, labels),
		changeLabel: forceNoBundleWithAssociatedDependentNote
			? undefined
			: bundleDeadlineState?.shouldOverrideActionToAdd
				? labels.addLabel
				: labels.changeLabel,
		actionDisabled: bundleDeadlineState?.actionDisabled,
		onChange: forceNoBundleWithAssociatedDependentNote ? undefined : () => {},
	});

	const firstSeat = passenger.seats?.[0];
	const seatTypeRowLabel = getSeatTypeRowLabel({
		seatServiceCode: firstSeat?.serviceCode,
		cabin: options?.seatTypeCabin,
		labels,
	});
	rows.push({
		id: CONFIRMATION_SUMMARY_ROW_IDS.seatType,
		icon: CONFIRMATION_SUMMARY_ROW_ICONS.seatType,
		label: labels.seatTypeLabel,
		groups: [
			{
				items: seatTypeRowLabel
					? [
							{
								label: seatTypeRowLabel,
								price: options?.seatTypePrice,
								note: labels.seatTypeNote,
							},
						]
					: buildPlaceholderItems(labels.notSelectedLabel),
			},
		],
	});

	const seatItems = mapSeatsToItems(passenger, labels, {
		forceAssociatedAdultSeatPriceToZero: options?.forceAssociatedAdultSeatPriceToZero,
	});
	const displayedSeatItems = seatDeadlineState?.shouldDisplayNotSelected
		? buildPlaceholderItems(labels.notSelectedLabel)
		: seatItems.length
			? seatItems
			: buildPlaceholderItems(labels.notSelectedLabel);
	rows.push({
		id: CONFIRMATION_SUMMARY_ROW_IDS.seat,
		icon: CONFIRMATION_SUMMARY_ROW_ICONS.seat,
		label: labels.seatLabel,
		groups: [
			{
				items: displayedSeatItems,
			},
		],
		warningMessage: getDeadlineWarningMessage(seatDeadlineState, labels.seatLabel, labels),
		changeLabel: seatDeadlineState?.shouldOverrideActionToAdd
			? labels.addLabel
			: getSummaryActionLabel(seatItems.length > 0, labels),
		actionDisabled: seatDeadlineState?.actionDisabled,
		onChange: () => {},
	});

	const baggageGroups = mapBaggageToGroups(passenger, labels);
	const displayedBaggageGroups = baggageDeadlineState?.shouldDisplayNotSelected
		? [{ items: buildPlaceholderItems(labels.notSelectedLabel) }]
		: baggageGroups?.length
			? baggageGroups
			: [{ items: buildPlaceholderItems(labels.notSelectedLabel) }];
	rows.push({
		id: CONFIRMATION_SUMMARY_ROW_IDS.baggage,
		icon: CONFIRMATION_SUMMARY_ROW_ICONS.baggage,
		label: labels.baggageLabel,
		groups: displayedBaggageGroups,
		warningMessage: getDeadlineWarningMessage(baggageDeadlineState, labels.baggageLabel, labels),
		changeLabel: baggageDeadlineState?.shouldOverrideActionToAdd
			? labels.addLabel
			: getSummaryActionLabel(
					getBaggageSelection(
						baggageGroups ?? [],
						labels.carryOnBaggage7kgLabel,
						labels.notSelectedLabel
					),
					labels
				),
		actionDisabled: baggageDeadlineState?.actionDisabled,
		onChange: () => {},
	});
	/**
	 * Appends a standard ancillary-service row to the summary list.
	 * Empty selections fall back to the shared not-selected placeholder.
	 */
	const addServiceRow = (
		id: StandardAncillarySummaryRowId,
		label: string,
		services: PassengerService[],
		options?: { hideEmptyAction?: boolean; showBundleNote?: boolean }
	) => {
		const deadlineState =
			id === CONFIRMATION_SUMMARY_ROW_IDS.meal
				? mealDeadlineState
				: id === CONFIRMATION_SUMMARY_ROW_IDS.priority
					? priorityDeadlineState
					: id === CONFIRMATION_SUMMARY_ROW_IDS.lounge
						? loungeDeadlineState
						: id === CONFIRMATION_SUMMARY_ROW_IDS.transport
							? transportDeadlineState
							: extrasDeadlineState;
		const items = mapServicesToItems(services, labels, {
			showBundleNote: options?.showBundleNote,
		});
		const displayedItems = deadlineState?.shouldDisplayNotSelected
			? buildPlaceholderItems(labels.notSelectedLabel)
			: items.length
				? items
				: buildPlaceholderItems(labels.notSelectedLabel);
		const hideAction =
			deadlineState?.shouldOverrideActionToAdd === true
				? false
				: options?.hideEmptyAction === true && items.length === 0;
		rows.push({
			id,
			icon: CONFIRMATION_SUMMARY_ROW_ICONS[id],
			label,
			groups: [{ items: displayedItems }],
			warningMessage: getDeadlineWarningMessage(deadlineState, label, labels),
			changeLabel: hideAction
				? undefined
				: deadlineState?.shouldOverrideActionToAdd
					? labels.addLabel
					: getSummaryActionLabel(items.length > 0, labels),
			actionDisabled: deadlineState?.actionDisabled,
			onChange: hideAction ? undefined : () => {},
		});
	};

	const mealItems = mapServicesToItems(passenger.services?.meals ?? [], labels, {
		showBundleNote: true,
	});
	const displayedMealItems = mealDeadlineState?.shouldDisplayNotSelected
		? buildPlaceholderItems(labels.notSelectedLabel)
		: mealItems.length
			? mealItems
			: buildPlaceholderItems(labels.notSelectedLabel);
	rows.push({
		id: CONFIRMATION_SUMMARY_ROW_IDS.meal,
		icon: CONFIRMATION_SUMMARY_ROW_ICONS.meal,
		label: labels.mealLabel,
		groups: [{ items: displayedMealItems }],
		warningMessage: getDeadlineWarningMessage(mealDeadlineState, labels.mealLabel, labels),
		changeLabel: mealDeadlineState?.shouldOverrideActionToAdd
			? labels.addLabel
			: getSummaryActionLabel(mealItems.length > 0, labels),
		actionDisabled: mealDeadlineState?.actionDisabled,
		onChange: () => {},
	});
	const priorityPlaceholderServices = options?.associatedPriorityPlaceholderServices ?? [];
	const hasAssociatedPriorityPlaceholder = priorityPlaceholderServices.length > 0;

	if (hasAssociatedPriorityPlaceholder) {
		rows.push({
			id: CONFIRMATION_SUMMARY_ROW_IDS.priority,
			icon: CONFIRMATION_SUMMARY_ROW_ICONS.priority,
			label: labels.priorityServicesLabel,
			groups: [
				{
					items: mapAssociatedPlaceholderItems(
						priorityPlaceholderServices,
						labels.priorityAssociatedDependentIncludedNote
					),
				},
			],
		});
	} else {
		addServiceRow(
			CONFIRMATION_SUMMARY_ROW_IDS.priority,
			labels.priorityServicesLabel,
			passenger.services?.express ?? [],
			{
				hideEmptyAction: hideAssociatedPriorityEmptyAction,
			}
		);
	}
	if (isAirportLoungeRouteEnabled) {
		const loungePlaceholderServices = options?.associatedAirportLoungePlaceholderServices ?? [];
		const hasAssociatedLoungePlaceholder = loungePlaceholderServices.length > 0;

		if (hasAssociatedLoungePlaceholder) {
			rows.push({
				id: CONFIRMATION_SUMMARY_ROW_IDS.lounge,
				icon: CONFIRMATION_SUMMARY_ROW_ICONS.lounge,
				label: labels.airportLoungeLabel,
				groups: [
					{
						items: mapAssociatedPlaceholderItems(
							loungePlaceholderServices,
							labels.infantAssociatedDependentIncludedNote
						),
					},
				],
			});
		} else {
			addServiceRow(
				CONFIRMATION_SUMMARY_ROW_IDS.lounge,
				labels.airportLoungeLabel,
				passenger.services?.lounge ?? [],
				{
					hideEmptyAction: hideAssociatedInfantEmptyAction,
				}
			);
		}
	}
	if (isTransportServiceRouteEnabled) {
		const transportPlaceholderServices = options?.associatedTransportPlaceholderServices ?? [];
		const hasAssociatedTransportPlaceholder = transportPlaceholderServices.length > 0;

		if (hasAssociatedTransportPlaceholder) {
			rows.push({
				id: CONFIRMATION_SUMMARY_ROW_IDS.transport,
				icon: CONFIRMATION_SUMMARY_ROW_ICONS.transport,
				label: labels.transportServicesLabel,
				groups: [
					{
						items: mapAssociatedPlaceholderItems(
							transportPlaceholderServices,
							labels.infantAssociatedDependentIncludedNote
						),
					},
				],
			});
		} else {
			addServiceRow(
				CONFIRMATION_SUMMARY_ROW_IDS.transport,
				labels.transportServicesLabel,
				passenger.services?.travel ?? [],
				{ hideEmptyAction: hideAssociatedInfantEmptyAction }
			);
		}
	}
	addServiceRow(
		CONFIRMATION_SUMMARY_ROW_IDS.extras,
		labels.ancillaryOptionalServicesLabel,
		passenger.services?.extras ?? [],
		{ showBundleNote: true }
	);

	if (
		!forceNoBundleWithAssociatedDependentNote &&
		hasFlexBizBundleSelection(passenger.bundles ?? [])
	) {
		rows.push({
			id: CONFIRMATION_SUMMARY_ROW_IDS.voucher,
			icon: CONFIRMATION_SUMMARY_ROW_ICONS.voucher,
			label: labels.flightChangeVoucherLabel,
			groups: [{ items: buildPlaceholderItems(labels.selectedLabel) }],
		});
	}

	return rows;
}

/**
 * Calculates the total confirmation amount for one passenger.
 * Includes bundle, seat, and ancillary prices unless bundle totals are excluded.
 */
export function getPassengerTotal(
	passenger: PassengerValues,
	options?: {
		excludeBundles?: boolean;
		forceAssociatedAdultSeatPriceToZero?: boolean;
		fareAmount?: number;
	}
): number {
	const fareTotal = options?.fareAmount ?? 0;
	const bundleTotal = options?.excludeBundles
		? 0
		: (passenger.bundles ?? []).reduce(
				(total, bundle) => total + (bundle.amount ?? bundle.bundleCategory?.amount ?? 0),
				0
			);
	const seatTotal = (passenger.seats ?? []).reduce(
		(total, seat) => total + getSeatApplicableAmount(passenger, seat, options),
		0
	);
	const allServices: PassengerService[] = (
		Object.values(passenger.services ?? {}) as PassengerService[][]
	).flat();
	const serviceTotal = allServices.reduce(
		(total, service) => total + getServiceApplicableAmount(service),
		0
	);
	return fareTotal + bundleTotal + seatTotal + serviceTotal;
}

/**
 * Builds the passenger information rows used by the confirmation details table.
 * Formats traveler identity, passport, nationality, and assistance values.
 */
export function getPassengerInfoRows(
	passengerValues: PassengerValues[],
	nationalityMap: Map<string, string> = new Map()
): PassengerInformationRow[] {
	return passengerValues.map((passenger) => {
		const services = Object.values(passenger.services ?? {}).flat() as PassengerService[];
		const needsAssistance = services.some((s) => SPECIAL_ASSISTANCE_SSR_CODES.has(s.ssrCode));
		const nationalityCode = passenger.apisInfo?.nationality ?? "";
		return {
			id: passenger.id,
			name: formatPassengerDisplayName(passenger),
			dateOfBirth: formatDatePart(passenger.dateOfBirth),
			passportNumber: passenger.apisInfo?.passportNumber ?? "",
			expiryDate: formatDatePart(passenger.apisInfo?.passportExpiryDate),
			nationality: nationalityMap.get(nationalityCode) ?? nationalityCode,
			needsAssistance,
			isInfant: isInfantPassengerType(passenger.passengerTypeCode),
		};
	});
}

/**
 * Merges personal and ancillary data into confirmation passenger cards.
 * Applies segment scoping and linked-passenger bundle restrictions when needed.
 */
export function buildPassengerDisplayList(
	passengerDetailsList: Passenger[],
	passengerValues: PassengerValues[],
	labels: SummaryLabels,
	segmentLfids?: ReadonlySet<number>,
	options?: {
		fareInfo?: FareInfo;
		isAirportLoungeRouteEnabled?: boolean;
		isTransportServiceRouteEnabled?: boolean;
		passengerDeadlineStatesById?: Record<string, ConfirmationPassengerDeadlineState>;
	}
): ConfirmationPassengerDisplay[] {
	const passengerValuesById = new Map(
		passengerValues.map((passenger) => [passenger.id, passenger])
	);

	return passengerDetailsList.map((passengerDetail) => {
		const storedValues = passengerValuesById.get(passengerDetail.id);
		const fullName = formatPassengerDisplayName({
			id: passengerDetail.id,
			firstName: passengerDetail.firstName ?? "",
			middleName: passengerDetail.middleName,
			lastName: passengerDetail.lastName ?? "",
		});
		const passengerType =
			passengerDetail.passengerTypeCode ?? storedValues?.passengerTypeCode ?? "adult";
		const needsAssistance =
			passengerDetail.nonChargeable?.assistanceService?.requestingAssistance === true;

		const passengerInfoRow: PassengerInformationRow = {
			id: passengerDetail.id,
			name: fullName,
			dateOfBirth: formatDatePart(passengerDetail.dateOfBirth),
			passportNumber: passengerDetail.apisInfo?.passportNumber ?? "",
			expiryDate: formatDatePart(passengerDetail.apisInfo?.passportExpiryDate),
			nationality: passengerDetail.apisInfo?.nationality ?? "",
			needsAssistance,
			isInfant: isInfantPassengerType(passengerType),
			onChange: () => {},
		};

		const passengerData: PassengerValues = storedValues ?? {
			id: passengerDetail.id,
			passengerTypeCode: passengerType,
			firstName: passengerDetail.firstName ?? "",
			lastName: passengerDetail.lastName ?? "",
		};
		const associatedAdultId = getAssociatedAdultId(passengerDetail, passengerData);
		const isPassengerAssociatedWithAdult = hasAssociatedAdult(passengerDetail, passengerData);
		const isAssociatedPriorityDependentPassenger =
			isAssociatedPriorityDependentPassengerType(passengerType) && isPassengerAssociatedWithAdult;
		const isAssociatedInfantPassenger =
			isAssociatedInfantPassengerType(passengerType) && isPassengerAssociatedWithAdult;
		const legScopedPassengerData = filterPassengerAncillariesByLfid(passengerData, segmentLfids);
		const shouldForceNoBundle = isRestrictedAssociatedPassenger(passengerDetail, passengerType);
		const seatTypePrice = getPassengerFareAmount(options?.fareInfo, passengerType);
		const forceAssociatedAdultSeatPriceToZero =
			isAdultPassengerType(passengerType) &&
			hasAssociatedChildOrInfantForAdult(
				passengerDetail,
				passengerDetailsList,
				passengerValuesById
			);
		const passengerPriorityServices = legScopedPassengerData.services?.express ?? [];
		const passengerTransportServices = legScopedPassengerData.services?.travel ?? [];
		const passengerLoungeServices = legScopedPassengerData.services?.lounge ?? [];
		const associatedAdultTransportServices = getAssociatedDependentServices(
			isAssociatedInfantPassenger,
			passengerTransportServices,
			{
				serviceKey: "travel",
				associatedAdultId,
				passengerValuesById,
				segmentLfids,
				requirePassengerServicesEmpty: true,
			}
		);
		const associatedAdultPriorityServices = getAssociatedDependentServices(
			isAssociatedPriorityDependentPassenger,
			passengerPriorityServices,
			{
				serviceKey: "express",
				associatedAdultId,
				passengerValuesById,
				segmentLfids,
			}
		);
		const associatedAdultLoungeServices = getAssociatedDependentServices(
			isAssociatedInfantPassenger,
			passengerLoungeServices,
			{
				serviceKey: "lounge",
				associatedAdultId,
				passengerValuesById,
				segmentLfids,
			}
		);

		return {
			id: passengerDetail.id,
			name: fullName,
			passengerTypeCode: passengerType,
			isInfant: isInfantPassengerType(passengerType),
			badgeLabel: getPassengerAgeBadge(passengerType),
			totalPrice: getPassengerTotal(legScopedPassengerData, {
				fareAmount: seatTypePrice,
				excludeBundles: shouldForceNoBundle,
				forceAssociatedAdultSeatPriceToZero,
			}),
			summaryRows: getPassengerSummaryRows(legScopedPassengerData, labels, {
				segmentLfids,
				passengerDeadlineState: options?.passengerDeadlineStatesById?.[passengerDetail.id],
				forceNoBundleWithAssociatedDependentNote: shouldForceNoBundle,
				forceAssociatedAdultSeatPriceToZero,
				hideAssociatedPriorityServiceAddButton: isAssociatedPriorityDependentPassenger,
				hideAssociatedInfantServiceAddButton: isAssociatedInfantPassenger,
				seatTypePrice,
				seatTypeCabin: options?.fareInfo?.cabin,
				associatedPriorityPlaceholderServices: associatedAdultPriorityServices,
				isAirportLoungeRouteEnabled: options?.isAirportLoungeRouteEnabled,
				associatedAirportLoungePlaceholderServices: associatedAdultLoungeServices,
				isTransportServiceRouteEnabled: options?.isTransportServiceRouteEnabled,
				associatedTransportPlaceholderServices: associatedAdultTransportServices,
			}),
			infoRow: passengerInfoRow,
		};
	});
}
