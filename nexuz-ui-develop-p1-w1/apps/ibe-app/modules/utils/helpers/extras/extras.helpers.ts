import type { NEXUZR004OffersAncillaryResponse } from "@repo/sdk";
import pokemonImage from "@/assets/images/pokemon.png";
import pokemonImage2 from "@/assets/images/pokemon2.png";
import type { selectCustomersListItem } from "@/components/common/select-customers/select-customers";
import { ALLOWED_AMENITY_SSR_CODES } from "@/modules/utils/constants/extras/extras";
import {
	type BookingFlowDirection,
	getBookingStageSegment,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { getPassengerLabel } from "@/modules/utils/helpers/common/passenger-label/passenger-label";
import type { ConfirmedFlightPayload } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	DialogSummary,
	ExtrasCategoryId,
	ExtrasProduct,
	PassengerForDialog,
} from "@/types/extras/extras.type";
import type { PassengerBundle, PassengerValues } from "@/types/passenger/passenger.type";

const PLACEHOLDER_IMAGE = pokemonImage.src;
const PLACEHOLDER_IMAGE_2 = pokemonImage2.src;

/**
 * Returns a set of SSR codes included in a passenger's bundles.
 * Optionally filters by a specific leg flight ID (lfid).
 * @param passenger - The passenger object containing optional bundle data
 * @param currentLfid - Optional leg flight ID to filter bundles by
 * @returns A set of SSR codes found in the matching bundles
 */
export function getBundledSsrCodesForPassenger(
	passenger: { bundles?: PassengerBundle[] },
	currentLfid?: number
): Set<string> {
	const bundledSsrCodes = new Set<string>();

	for (const bundle of passenger.bundles ?? []) {
		if (currentLfid !== undefined && bundle.lfid !== currentLfid) {
			continue;
		}

		for (const category of bundle.bundleCategory?.categories ?? []) {
			for (const service of category.services ?? []) {
				bundledSsrCodes.add(service.code);
			}
		}
	}

	return bundledSsrCodes;
}

const CATEGORY_ID_MAP: Record<string, ExtrasCategoryId> = {
	Amenity: "amenities",
	airport_services: "airport-services",
};

/**
 * Maps ancillary API response data to a flat list of ExtrasProduct objects.
 * Filters to adult passenger types and allowed amenity SSR codes only.
 * @param data - The ancillary offers response from the API, or undefined
 * @returns An array of mapped ExtrasProduct objects
 */
export function mapAncillaryDataToProducts(
	data: NEXUZR004OffersAncillaryResponse | undefined
): ExtrasProduct[] {
	if (!data) {
		return [];
	}

	return data.data.servicesPerPassengerType
		.filter((passengerType) => passengerType.passengerType.toLowerCase() === "adult")
		.flatMap((passengerType) =>
			passengerType.categories
				.filter((category) => category.title === "Amenity")
				.flatMap((category) => {
					const categoryId = CATEGORY_ID_MAP[category.title];

					if (!categoryId) {
						return [];
					}

					return category.specialServices
						.filter((service) => ALLOWED_AMENITY_SSR_CODES.has(service.ssrCode))
						.map(
							(service, index): ExtrasProduct => ({
								id: `${categoryId}-${service.ssrId}`,
								categoryId,
								ssrCode: service.ssrCode,
								qtyAvailable: service.qtyAvailable,
								name: service.description,
								description: service.description,
								price: service.amount,
								imageSrc: PLACEHOLDER_IMAGE,
								images:
									index === 0 ? [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE_2] : [PLACEHOLDER_IMAGE],
								serviceID: service.ssrId,
								lfid: service.lfid,
								...(service.pfid !== undefined ? { pfid: service.pfid } : {}),
								cutOffHours: service.cutOffHours,
								maxCountServiceLevel: service.maxCountServiceLevel,
								numericCategoryId: category.categoryId,
								passengerType: passengerType.passengerType,
								remainingLabel:
									service.qtyAvailable === 0
										? "Out of Stock"
										: service.qtyAvailable < 10
											? `${service.qtyAvailable} remaining`
											: undefined,
								disabled: service.qtyAvailable === 0,
							})
						);
				})
		);
}

/**
 * Updates selected category IDs based on category selection changes.
 * Handles "all" category logic and ensures at least one category is always selected.
 */
export function updateSelectedCategoryIds(prevSelected: string[], categoryId: string): string[] {
	if (categoryId === "all") {
		return prevSelected.includes("all") ? prevSelected : ["all"];
	}

	if (prevSelected.includes("all")) {
		return [categoryId];
	}

	if (prevSelected.includes(categoryId)) {
		const updated = prevSelected.filter((id) => id !== categoryId);
		return updated.length === 0 ? ["all"] : updated;
	}

	return [...prevSelected, categoryId];
}

/**
 * Filters products by selected category.
 * Returns all products if "all" category is selected.
 */
export function getProductsByCategory(
	products: ExtrasProduct[],
	categoryId: string
): ExtrasProduct[] {
	if (categoryId === "all") {
		return products;
	}

	return products.filter((product) => product.categoryId === categoryId);
}

/**
 * Updates passenger selections when a single passenger is toggled.
 * Respects quantity available limits and bundled passenger restrictions.
 */
export function updatePassengerSelections(
	prevSelections: Record<string, boolean>,
	passengerId: string,
	checked: boolean,
	bundledPassengerIds: string[],
	availableQty: number
): Record<string, boolean> {
	const bundledSet = new Set(bundledPassengerIds);

	// Cannot change bundled passenger selections
	if (bundledSet.has(passengerId)) {
		return prevSelections;
	}

	// Calculate currently selected count (excluding bundled passengers)
	const currentlySelectedCount = Object.entries(prevSelections).filter(
		([id, isSelected]) => isSelected && !bundledSet.has(id)
	).length;

	// If trying to select but already at max capacity, don't update
	if (
		checked &&
		!prevSelections[passengerId] &&
		availableQty > 0 &&
		currentlySelectedCount >= availableQty
	) {
		return prevSelections;
	}

	return {
		...prevSelections,
		[passengerId]: checked,
	};
}

/**
 * Creates passenger list with metadata for dialog display.
 */
export function getPassengersForDialog(passengers: PassengerForDialog[]): PassengerForDialog[] {
	return passengers.map((passenger) => ({
		...passenger,
		price: 0,
		checked: false,
	}));
}

/**
 * Gets select-all selections for passengers respecting quantity limits.
 * Bundled passengers are always included, others are selected up to available quantity.
 */
export function getSelectAllSelections(
	passengers: PassengerForDialog[],
	bundledPassengerIds: string[],
	availableQty: number,
	selectAll: boolean
): Record<string, boolean> {
	const bundledSet = new Set(bundledPassengerIds);
	const newSelections: Record<string, boolean> = {};

	if (!selectAll) {
		// Deselect all non-bundled, keep bundled selected
		for (const passenger of passengers) {
			newSelections[passenger.id] = bundledSet.has(passenger.id);
		}
	} else {
		// Select up to available quantity, always keep bundled selected
		let selectableCount = 0;
		for (const passenger of passengers) {
			if (bundledSet.has(passenger.id)) {
				newSelections[passenger.id] = true;
				continue;
			}

			newSelections[passenger.id] = selectableCount < availableQty;
			if (newSelections[passenger.id]) {
				selectableCount += 1;
			}
		}
	}

	return newSelections;
}

/**
 * Calculates dialog summary including totals and state flags.
 */
export function getDialogSummary(
	dialogProduct: ExtrasProduct | null,
	passengerSelections: Record<string, boolean>,
	bundledPassengerIds: string[],
	totalNonBundledPassengers: number
): DialogSummary {
	const bundledSet = new Set(bundledPassengerIds);
	const selectedPaidPassengerCount = Object.entries(passengerSelections).filter(
		([passengerId, isSelected]) => isSelected && !bundledSet.has(passengerId)
	).length;

	const dialogTotal = (dialogProduct?.price ?? 0) * selectedPaidPassengerCount;
	const isDialogSelectionFull =
		typeof dialogProduct?.qtyAvailable === "number" &&
		dialogProduct.qtyAvailable > 0 &&
		selectedPaidPassengerCount >= dialogProduct.qtyAvailable;

	const shouldShowOutOfStockAlert =
		selectedPaidPassengerCount > 0 &&
		isDialogSelectionFull &&
		selectedPaidPassengerCount < totalNonBundledPassengers;

	return {
		selectedPaidPassengerCount,
		dialogTotal,
		isDialogSelectionFull,
		shouldShowOutOfStockAlert,
	};
}

/**
 * Gets the list of category IDs to show based on selection.
 * Returns all section IDs if "all" is selected, otherwise returns the selected IDs.
 */
export function getCategoriesToShow(
	selectedCategoryIds: string[],
	allSections: Array<{ id: string }>
): string[] {
	return selectedCategoryIds.includes("all")
		? allSections.map((section) => section.id)
		: selectedCategoryIds;
}

/**
 * Builds the visible sections array filtered by category selection with titles and products.
 */
export function getVisibleSections<TSection extends { id: string; name: string }>(
	allSections: TSection[],
	categoriesToShow: string[],
	getProductsFn: (categoryId: string) => ExtrasProduct[]
): Array<TSection & { title: string; products: ExtrasProduct[] }> {
	return allSections
		.filter((section) => categoriesToShow.includes(section.id))
		.map((section) => ({
			...section,
			title: section.name,
			products: getProductsFn(section.id),
		}));
}

/**
 * Checks whether any passenger has a PREN bundle code.
 * Optionally filters by a specific leg flight ID (lfid).
 * @param passengers - List of passenger values to check
 * @param currentLfid - Optional leg flight ID to filter bundles by
 * @returns true if at least one passenger has a PREN bundle for the given lfid
 */
export const checkBundlePassenger = (
	passengers: PassengerValues[],
	currentLfid?: number
): boolean => {
	return passengers.some((passenger) =>
		(passenger.bundles ?? []).some(
			(bundle) =>
				bundle.bundleCode === "PREN" && (currentLfid === undefined || bundle.lfid === currentLfid)
		)
	);
};

/**
 * Creates a select-list item from a passenger's values.
 * Combines first, middle, and last name into a full name and derives the display category.
 * @param passenger - The passenger values to convert
 * @returns A selectCustomersListItem with id, name, category, price, and checked state
 */

export const createPassengerItem = (
	passenger: PassengerValues,
	t: (key: string) => string
): selectCustomersListItem => {
	const fullName = [passenger.firstName, passenger.middleName, passenger.lastName]
		.filter(Boolean)
		.join(" ")
		.trim();

	return {
		id: passenger.id,
		name: fullName,
		category: getPassengerLabel(passenger.passengerTypeCode, t),
		price: 0,
		checked: false,
	};
};

export function getExtrasSegment(
	confirmedFlight: ConfirmedFlightPayload | undefined,
	direction: BookingFlowDirection
) {
	if (!confirmedFlight) return undefined;

	const stage = getBookingStageSegment({ confirmedFlight, direction });

	if (stage === "segment1" || stage === "outbound") {
		return confirmedFlight.flights.outbound.segments[0];
	}

	if (stage === "segment2") {
		return (
			confirmedFlight.flights.inbound?.segments[0] ?? confirmedFlight.flights.outbound.segments[1]
		);
	}

	return (
		confirmedFlight.flights.inbound?.segments[0] ?? confirmedFlight.flights.outbound.segments[0]
	);
}
