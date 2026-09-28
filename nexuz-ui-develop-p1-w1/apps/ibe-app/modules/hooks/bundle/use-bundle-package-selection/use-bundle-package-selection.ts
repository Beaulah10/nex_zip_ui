/**
 * File: use-bundle-package-selection.ts
 * Description: Custom hook responsible for bundle package selection and management
 * during the booking journey. It coordinates bundle pricing and availability,
 * passenger selection logic, purchase deadline restrictions, eligibility rules,
 * upgrade confirmations, validation handling, and booking flow navigation to ensure a consistent
 */
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createElement, useCallback, useEffect, useMemo, useState } from "react";
import { InfantIcon } from "@/assets/images/infant-icon";
import { useDepartureDeadline } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { BUNDLE_CODES } from "@/modules/utils/constants/bundle/bundle.constants";
import { getTranslatedBundleOptions } from "@/modules/utils/constants/bundle/bundle-offer-overview.translations";
import {
	getAvailableBundleIds,
	getBundleCapacities,
	getBundlePrices,
	getBundleSegment,
	getLocaleFromParam,
	getPassengerDisplayName,
	getUnavailableBundleIds,
	isAdultPassengerTypeCode,
	isAllBundlesUnavailable,
	isBundleUnavailable,
	isRouteConnectedToAirport,
} from "@/modules/utils/helpers/bundle/bundle.helpers";
import {
	getBookingStageRoute,
	getBookingStageSegment,
	getNextBookingFlowPath,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { useAppSelector } from "@/store/hooks";
import {
	selectBundleOffersData,
	selectBundleOffersError,
	selectSelectedBundlesBySegment,
} from "@/store/slices/bundle-offers/bundle-offers.slice";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	BundleId,
	BundleSelectionMap,
	PassengerEntry,
	PendingConfirmationChange,
	UseBundlePackageSelectionArgs,
} from "@/types/bundle/bundle.types";

type Selection = BundleSelectionMap;

function getBundleCode(bundleIds: readonly BundleId[], index: number): BundleId {
	const bundleId = bundleIds[index];
	if (!bundleId) {
		throw new Error("Missing bundle code");
	}
	return bundleId;
}

const NO_BUNDLE_ID = getBundleCode(BUNDLE_CODES.NO_BUNDLE, 0);
const FLEX_BIZ_BUNDLE_ID = getBundleCode(BUNDLE_CODES.FLEX_BIZ, 1);

const CHILD_PASSENGER_ICON = createElement(InfantIcon, {
	className: "text-primary-700",
	"aria-hidden": true,
	focusable: false,
});

export function useBundlePackageSelection({
	locale,
	direction,
	isICNRoute,
	onProceed,
}: UseBundlePackageSelectionArgs) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const params = useParams<{ locale?: string | string[] }>();
	const t = useTranslations("bundle_page");
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const { isBundlePurchaseDeadlineExceeded, bundleDeadlineHours } = useDepartureDeadline(direction);
	const passengerList = useAppSelector(selectPassengerList);
	const bundleOffersData = useAppSelector(selectBundleOffersData);
	const bundleOffersError = useAppSelector(selectBundleOffersError);
	const selectedBundlesBySegment = useAppSelector(selectSelectedBundlesBySegment);
	const currentSegment = getBundleSegment(confirmedFlight, direction);
	const storedPassengerBundles = useAppSelector((state) => state.passenger.passengers);
	const isConfirmationChangeFlow = searchParams.get("changeFlow") === "confirmation";
	const confirmationChangeQuery = isConfirmationChangeFlow ? searchParams.toString() : "";

	const storedSelection = useMemo(() => {
		if (!currentSegment) return {};

		const selectedBundles = selectedBundlesBySegment?.[String(currentSegment.lfid)];
		if (selectedBundles) return selectedBundles;

		return passengerList.reduce<Selection>((selection, passenger) => {
			const bundle = storedPassengerBundles
				.find((storedPassenger) => storedPassenger.id === passenger.id)
				?.bundles?.find((storedBundle) => storedBundle.lfid === currentSegment.lfid);
			if (bundle) selection[passenger.id] = bundle.bundleCode as BundleId;
			return selection;
		}, {});
	}, [currentSegment, passengerList, selectedBundlesBySegment, storedPassengerBundles]);

	const effectiveLocale = locale ?? getLocaleFromParam(params?.locale);
	const stageSegment = getBookingStageSegment({ confirmedFlight, direction });
	const stageLabel = t(`stage_labels_${stageSegment}`);
	const currentRoute = getBookingStageRoute({
		section: "bundles",
		confirmedFlight,
		direction,
	});

	const inferredICNRoute = useMemo(
		() => isRouteConnectedToAirport(confirmedFlight, "ICN"),
		[confirmedFlight]
	);

	const isYvrRoute = useMemo(
		() => isRouteConnectedToAirport(confirmedFlight, "YVR"),
		[confirmedFlight]
	);

	const availableBundleIds = useMemo(
		() => getAvailableBundleIds(bundleOffersData, confirmedFlight, direction),
		[bundleOffersData, confirmedFlight, direction]
	);

	const allBundlesUnavailable = useMemo(
		() => isAllBundlesUnavailable(bundleOffersData, availableBundleIds, bundleOffersError?.code),
		[bundleOffersData, availableBundleIds, bundleOffersError?.code]
	);
	const hasFlexBizData = availableBundleIds?.has(FLEX_BIZ_BUNDLE_ID) ?? false;

	const bundleCapacities = useMemo(
		() => getBundleCapacities(bundleOffersData, confirmedFlight, direction),
		[bundleOffersData, confirmedFlight, direction]
	);

	const isBundleDisabled = useCallback(
		(bundleId: BundleId) =>
			bundleId !== NO_BUNDLE_ID &&
			(isBundlePurchaseDeadlineExceeded ||
				allBundlesUnavailable ||
				isBundleUnavailable(bundleId, availableBundleIds) ||
				bundleCapacities?.get(bundleId) === 0),
		[allBundlesUnavailable, availableBundleIds, bundleCapacities, isBundlePurchaseDeadlineExceeded]
	);

	const bundlePrices = useMemo(
		() => getBundlePrices(bundleOffersData, confirmedFlight, direction),
		[bundleOffersData, confirmedFlight, direction]
	);

	const bundleDefinitions = useMemo(
		() => getTranslatedBundleOptions(t, isICNRoute ?? inferredICNRoute),
		[t, isICNRoute, inferredICNRoute]
	);
	const bundles = useMemo(
		() =>
			bundleDefinitions.map((bundle) => ({
				...bundle,
				price: bundle.id === NO_BUNDLE_ID ? 0 : bundlePrices[bundle.id],
			})),
		[bundleDefinitions, bundlePrices]
	);

	const passengers = useMemo(
		() =>
			passengerList.map((passenger, index) => {
				const isAdult = isAdultPassengerTypeCode(passenger.passengerTypeCode);
				const isInfant = passenger.passengerTypeCode?.toLowerCase() === "infant";
				return {
					id: passenger.id,
					name: getPassengerDisplayName(passenger, index),
					icon: isInfant ? CHILD_PASSENGER_ICON : "person",
					isAdult,
					accompanyingAdultId: passenger.associateWithPassengerId?.trim() || null,
					hasAccompanyingAdult: passenger.hasAccompanyingAdult ?? false,
				};
			}),
		[passengerList]
	);

	const passengersGroups = useMemo<PassengerEntry[]>(() => {
		const passengersById = new Map(passengers.map((passenger) => [passenger.id, passenger]));
		const waivedChildrenByAdultId = new Map<string, typeof passengers>();

		for (const passenger of passengers) {
			if (
				passenger.isAdult ||
				!passenger.hasAccompanyingAdult ||
				!passenger.accompanyingAdultId ||
				!passengersById.has(passenger.accompanyingAdultId)
			) {
				continue;
			}

			const children = waivedChildrenByAdultId.get(passenger.accompanyingAdultId) ?? [];
			children.push(passenger);
			waivedChildrenByAdultId.set(passenger.accompanyingAdultId, children);
		}

		if (waivedChildrenByAdultId.size === 0 && passengers.every((passenger) => !passenger.isAdult)) {
			return passengers.map(({ id, name, icon }) => ({
				kind: "passenger" as const,
				id,
				name,
				icon,
			}));
		}

		const waivedGroupsByAdultId = new Map<string, PassengerEntry>();
		for (const [adultId, children] of waivedChildrenByAdultId) {
			const adult = passengersById.get(adultId);
			if (!adult) continue;

			waivedGroupsByAdultId.set(adultId, {
				kind: "unavailable-group",
				id: `waived-seat-passengers-${adultId}`,
				passengers: [adult, ...children].map(({ id, name, icon }) => ({ id, name, icon })),
				message: t("selection_table_only_no_bundle_available_for_these_passengers"),
			});
		}

		const prioritizedIds = new Set<string>();
		const prioritizedEntries: PassengerEntry[] = [];
		const primaryPassenger = passengers[0];

		if (primaryPassenger) {
			const primaryGroup = waivedGroupsByAdultId.get(primaryPassenger.id);
			prioritizedEntries.push(
				primaryGroup ?? {
					kind: "passenger",
					id: primaryPassenger.id,
					name: primaryPassenger.name,
					icon: primaryPassenger.icon,
				}
			);
			prioritizedIds.add(primaryPassenger.id);
			if (primaryGroup?.kind === "unavailable-group") {
				for (const passenger of primaryGroup.passengers) prioritizedIds.add(passenger.id);
			}
		}

		for (const adult of passengers) {
			const adultGroup = waivedGroupsByAdultId.get(adult.id);
			if (
				!adult.isAdult ||
				adultGroup?.kind !== "unavailable-group" ||
				prioritizedIds.has(adult.id)
			) {
				continue;
			}

			prioritizedEntries.push(adultGroup);
			for (const passenger of adultGroup.passengers) prioritizedIds.add(passenger.id);
		}

		const remainingPassengers = passengers.filter((passenger) => !prioritizedIds.has(passenger.id));
		return [
			...prioritizedEntries,
			...remainingPassengers.map(({ id, name, icon }) => ({
				kind: "passenger" as const,
				id,
				name,
				icon,
			})),
		];
	}, [passengers, t]);

	const [outboundApplyToAll, setOutboundApplyToAll] = useState(true);
	const [inboundApplyToAll, setInboundApplyToAll] = useState(true);
	const [outboundSelection, setOutboundSelection] = useState<Selection>({});
	const [inboundSelection, setInboundSelection] = useState<Selection>({});
	const [showValidation, setShowValidation] = useState(false);
	const [validationAttempt, setValidationAttempt] = useState(0);
	const [hasSelectionInteraction, setHasSelectionInteraction] = useState(false);
	const [limitedBundleAttemptIds, setLimitedBundleAttemptIds] = useState<BundleId[]>([]);
	const [hasConfirmedChangeWarning, setHasConfirmedChangeWarning] = useState(false);
	const [isConfirmationChangeDialogOpen, setIsConfirmationChangeDialogOpen] = useState(false);
	const [pendingConfirmationChange, setPendingConfirmationChange] =
		useState<PendingConfirmationChange | null>(null);
	const [pendingFlexBiz, setPendingFlexBiz] = useState<{ id?: string; applyToAll: boolean } | null>(
		null
	);
	const [flexBizDialogOpen, setFlexBizDialogOpen] = useState(false);
	/**
	 * Updates the bundle assignment for a specific passenger within
	 * the provided selection state while preserving all existing selections.
	 */
	const confirmationStoredSelection = useMemo(
		() =>
			isConfirmationChangeFlow
				? passengerList.reduce<Selection>((selection, passenger) => {
						selection[passenger.id] = storedSelection[passenger.id] ?? NO_BUNDLE_ID;
						return selection;
					}, {})
				: storedSelection,
		[isConfirmationChangeFlow, passengerList, storedSelection]
	);

	useEffect(() => {
		if (direction === "inbound") {
			setInboundSelection(confirmationStoredSelection);
		} else {
			setOutboundSelection(confirmationStoredSelection);
		}
	}, [confirmationStoredSelection, direction]);

	const updateSelection = useCallback(
		(setter: React.Dispatch<React.SetStateAction<Selection>>, id: string, value: BundleId) =>
			setter((current) => ({ ...current, [id]: value })),
		[]
	);

	/**
	 * Creates a new bundle selection map by assigning the specified
	 * bundle to a single passenger while preserving existing selections.
	 */
	const isInbound = direction === "inbound";
	const applyToAll = isInbound ? inboundApplyToAll : outboundApplyToAll;
	const setApplyToAll = isInbound ? setInboundApplyToAll : setOutboundApplyToAll;
	const selection = isInbound ? inboundSelection : outboundSelection;
	const setSelection = isInbound ? setInboundSelection : setOutboundSelection;
	/**
	 * Creates a new selection map with the specified bundle assigned
	 * to the target passenger while preserving all existing selections.
	 */
	const buildSelectionWithBundle = useCallback(
		(currentSelection: Selection, id: string, value: BundleId) => ({
			...currentSelection,
			[id]: value,
		}),
		[]
	);

	const buildApplyToAllSelection = useCallback(
		(currentSelection: Selection, value: BundleId, bundleCapacity: number | null) => {
			const next = { ...currentSelection };
			let assigned = 0;

			for (const entry of passengersGroups) {
				if (entry.kind === "passenger") {
					if (bundleCapacity === null || assigned < bundleCapacity) {
						next[entry.id] = value;
						assigned += 1;
					} else {
						next[entry.id] = NO_BUNDLE_ID;
					}
					continue;
				}

				for (const passenger of entry.passengers) {
					next[passenger.id] = NO_BUNDLE_ID;
				}
			}

			return next;
		},
		[passengersGroups]
	);

	const shouldWarnBeforeConfirmationChange = useCallback(
		(nextSelection: Selection) => {
			if (!isConfirmationChangeFlow || hasConfirmedChangeWarning) {
				return false;
			}

			return passengerList.some(
				(passenger) =>
					(nextSelection[passenger.id] ?? NO_BUNDLE_ID) !==
					(confirmationStoredSelection[passenger.id] ?? NO_BUNDLE_ID)
			);
		},
		[
			confirmationStoredSelection,
			hasConfirmedChangeWarning,
			isConfirmationChangeFlow,
			passengerList,
		]
	);

	const allAdultsAssociatedWithChildren = useMemo(() => {
		const adultIds = passengerList
			.filter((passenger) => isAdultPassengerTypeCode(passenger.passengerTypeCode))
			.map((passenger) => passenger.id);

		if (adultIds.length === 0) return false;

		const associatedAdultIds = new Set(
			passengerList
				.filter(
					(passenger) =>
						!isAdultPassengerTypeCode(passenger.passengerTypeCode) &&
						passenger.hasAccompanyingAdult === true &&
						passenger.associateWithPassengerId?.trim()
				)
				.map((passenger) => passenger.associateWithPassengerId?.trim())
		);

		return adultIds.every((adultId) => associatedAdultIds.has(adultId));
	}, [passengerList]);

	const showEligibilityBanner = useMemo(() => {
		const eligiblePassengerTypes = isYvrRoute
			? new Set(["childa", "childb", "childc", "infant"])
			: new Set(["childc", "infant"]);

		return passengerList.some(
			(passenger) =>
				!isAdultPassengerTypeCode(passenger.passengerTypeCode) &&
				passenger.hasAccompanyingAdult === true &&
				eligiblePassengerTypes.has(passenger.passengerTypeCode?.toLowerCase() ?? "")
		);
	}, [isYvrRoute, passengerList]);

	const openFlexBizDialog = useCallback(
		(id?: string) => {
			setPendingFlexBiz({ id, applyToAll: id === undefined || applyToAll });
			setFlexBizDialogOpen(true);
		},
		[applyToAll]
	);

	const requestFlexBizSelection = useCallback(
		(id?: string) => {
			const nextApplyToAll = id === undefined || applyToAll;
			const nextSelection = nextApplyToAll
				? buildApplyToAllSelection(
						selection,
						FLEX_BIZ_BUNDLE_ID,
						bundleCapacities?.get(FLEX_BIZ_BUNDLE_ID) ?? null
					)
				: buildSelectionWithBundle(selection, id, FLEX_BIZ_BUNDLE_ID);

			if (shouldWarnBeforeConfirmationChange(nextSelection)) {
				setPendingConfirmationChange({
					kind: "flex-biz",
					id,
					applyToAll: nextApplyToAll,
				});
				setIsConfirmationChangeDialogOpen(true);
				return;
			}

			openFlexBizDialog(id);
		},
		[
			applyToAll,
			buildApplyToAllSelection,
			buildSelectionWithBundle,
			bundleCapacities,
			openFlexBizDialog,
			selection,
			shouldWarnBeforeConfirmationChange,
		]
	);

	const confirmFlexBizSelection = useCallback(() => {
		if (!pendingFlexBiz) return;
		if (pendingFlexBiz.applyToAll) {
			setSelection((current) => {
				const next = { ...current };
				let assigned = 0;
				const capacity = bundleCapacities?.get(FLEX_BIZ_BUNDLE_ID) ?? null;
				for (const entry of passengersGroups) {
					if (entry.kind === "unavailable-group") {
						for (const passenger of entry.passengers) next[passenger.id] = NO_BUNDLE_ID;
					} else if (capacity === null || assigned < capacity) {
						next[entry.id] = FLEX_BIZ_BUNDLE_ID;
						assigned += 1;
					} else {
						next[entry.id] = NO_BUNDLE_ID;
					}
				}
				return next;
			});
		} else if (pendingFlexBiz.id) {
			updateSelection(setSelection, pendingFlexBiz.id, FLEX_BIZ_BUNDLE_ID);
		}
		setPendingFlexBiz(null);
		setFlexBizDialogOpen(false);
	}, [bundleCapacities, passengersGroups, pendingFlexBiz, setSelection, updateSelection]);

	const selectablePassengers = useMemo(
		() =>
			passengersGroups.filter(
				(entry): entry is Extract<PassengerEntry, { kind: "passenger" }> =>
					entry.kind === "passenger"
			),
		[passengersGroups]
	);

	const missingSelectionPassengers = useMemo(
		() => selectablePassengers.filter((entry) => !selection[entry.id]),
		[selectablePassengers, selection]
	);

	const hasNoSelectionAtAll =
		selectablePassengers.length > 0 &&
		missingSelectionPassengers.length === selectablePassengers.length;

	const invalidPassengerIds = useMemo(
		() =>
			showValidation
				? new Set(missingSelectionPassengers.map((passenger) => passenger.id))
				: new Set<string>(),
		[missingSelectionPassengers, showValidation]
	);

	const unavailableBundleIds = useMemo(
		() =>
			getUnavailableBundleIds(
				bundles.map((bundle) => bundle.id).filter((id) => id !== NO_BUNDLE_ID),
				availableBundleIds
			),
		[bundles, availableBundleIds]
	);

	const limitedBundleIds = useMemo(
		() => [
			...new Set([
				...Object.values(selection).filter((bundleId): bundleId is BundleId => {
					if (bundleId === null || bundleId === NO_BUNDLE_ID || bundleCapacities === null)
						return false;
					return (bundleCapacities.get(bundleId) ?? 0) < selectablePassengers.length;
				}),
				...limitedBundleAttemptIds,
			]),
		],
		[selection, bundleCapacities, selectablePassengers.length, limitedBundleAttemptIds]
	);

	const validationMessage =
		showValidation && missingSelectionPassengers.length > 0
			? hasNoSelectionAtAll
				? t("error_labels.select_any_bundle_to_proceed", { stageLabel })
				: t("error_labels.select_bundle_for_passengers", {
						stageLabel,
						passengers: missingSelectionPassengers
							.map((passenger) => `"${passenger.name}"`)
							.join(", "),
					})
			: null;

	const topValidationMessage = hasNoSelectionAtAll ? validationMessage : null;
	const hasSelectionChangedFromConfirmationState = useMemo(() => {
		if (!isConfirmationChangeFlow) {
			return false;
		}

		return passengerList.some(
			(passenger) =>
				(selection[passenger.id] ?? NO_BUNDLE_ID) !==
				(confirmationStoredSelection[passenger.id] ?? NO_BUNDLE_ID)
		);
	}, [confirmationStoredSelection, isConfirmationChangeFlow, passengerList, selection]);

	useEffect(() => {
		if (!allBundlesUnavailable && !isBundlePurchaseDeadlineExceeded) return;

		setSelection((current) => {
			const eligiblePassengerIds = passengersGroups
				.filter((entry) => entry.kind === "passenger")
				.map((entry) => entry.id);
			const allAlreadyNoBundle = eligiblePassengerIds.every((id) => current[id] === NO_BUNDLE_ID);
			if (allAlreadyNoBundle) return current;
			return Object.fromEntries(eligiblePassengerIds.map((id) => [id, NO_BUNDLE_ID])) as Selection;
		});
	}, [allBundlesUnavailable, isBundlePurchaseDeadlineExceeded, passengersGroups, setSelection]);

	const onApplyToAllChange = useCallback(
		(value: boolean) => {
			setHasSelectionInteraction(true);
			setApplyToAll(value);

			if (!value) {
				setLimitedBundleAttemptIds([]);
				return;
			}

			setShowValidation(false);
			if (Object.keys(storedSelection).length === 0) {
				setSelection((current) => {
					const next = { ...current };
					for (const passenger of selectablePassengers) {
						delete next[passenger.id];
					}
					return next;
				});
			}
		},
		[selectablePassengers, setApplyToAll, setSelection, storedSelection]
	);

	const onLimitedBundleAttempt = useCallback((bundleId: BundleId) => {
		setHasSelectionInteraction(true);
		setLimitedBundleAttemptIds((current) =>
			current.includes(bundleId) ? current : [...current, bundleId]
		);
	}, []);

	const onSelectionChange = useCallback(
		(id: string, value: BundleId) => {
			setHasSelectionInteraction(true);
			const nextSelection = buildSelectionWithBundle(selection, id, value);

			if (shouldWarnBeforeConfirmationChange(nextSelection)) {
				setPendingConfirmationChange({ kind: "selection", nextSelection });
				setIsConfirmationChangeDialogOpen(true);
				return;
			}

			updateSelection(setSelection, id, value);
		},
		[
			buildSelectionWithBundle,
			selection,
			setSelection,
			shouldWarnBeforeConfirmationChange,
			updateSelection,
		]
	);

	const onApplyBundleToAllChange = useCallback(
		(value: BundleId, bundleCapacity: number | null) => {
			setHasSelectionInteraction(true);
			const nextSelection = buildApplyToAllSelection(selection, value, bundleCapacity);

			if (shouldWarnBeforeConfirmationChange(nextSelection)) {
				setPendingConfirmationChange({ kind: "selection", nextSelection });
				setIsConfirmationChangeDialogOpen(true);
				return;
			}

			setSelection(nextSelection);
		},
		[buildApplyToAllSelection, selection, setSelection, shouldWarnBeforeConfirmationChange]
	);

	const onProceedClick = useCallback(() => {
		setHasSelectionInteraction(true);
		if (missingSelectionPassengers.length > 0) {
			setShowValidation(true);
			setValidationAttempt((attempt) => attempt + 1);
			return;
		}

		if (isConfirmationChangeFlow && !hasSelectionChangedFromConfirmationState) {
			router.push(`/${effectiveLocale}/confirmation`);
			return;
		}

		onProceed?.({
			outbound: outboundSelection,
			inbound: inboundSelection,
		});

		router.push(
			`${getNextBookingFlowPath({
				locale: effectiveLocale,
				confirmedFlight,
				currentRoute,
			})}${confirmationChangeQuery ? `?${confirmationChangeQuery}` : ""}`
		);
	}, [
		confirmationChangeQuery,
		confirmedFlight,
		currentRoute,
		effectiveLocale,
		hasSelectionChangedFromConfirmationState,
		inboundSelection,
		isConfirmationChangeFlow,
		missingSelectionPassengers.length,
		onProceed,
		outboundSelection,
		router,
	]);

	const handleConfirmationChangeCancel = useCallback(() => {
		setPendingConfirmationChange(null);
		setIsConfirmationChangeDialogOpen(false);
	}, []);

	const handleConfirmationChangeConfirm = useCallback(() => {
		if (!pendingConfirmationChange) {
			setIsConfirmationChangeDialogOpen(false);
			return;
		}

		setHasConfirmedChangeWarning(true);
		setIsConfirmationChangeDialogOpen(false);

		if (pendingConfirmationChange.kind === "selection") {
			setSelection(pendingConfirmationChange.nextSelection);
			setPendingConfirmationChange(null);
			return;
		}

		openFlexBizDialog(pendingConfirmationChange.id);
		setPendingConfirmationChange(null);
	}, [openFlexBizDialog, pendingConfirmationChange, setSelection]);

	const alertProps = useMemo(
		() => ({
			allBundlesUnavailable,
			isBundlePurchaseDeadlineExceeded,
			stageLabel,
			bundleDeadlineHours,
			unavailableBundleIds,
			showOutOfStockAlert: !allAdultsAssociatedWithChildren,
			bundles,
			hasSelectionInteraction,
			limitedBundleIds,
			applyToAll,
			topValidationMessage,
			validationAttempt,
		}),
		[
			allAdultsAssociatedWithChildren,
			allBundlesUnavailable,
			applyToAll,
			bundleDeadlineHours,
			bundles,
			hasSelectionInteraction,
			isBundlePurchaseDeadlineExceeded,
			limitedBundleIds,
			stageLabel,
			topValidationMessage,
			unavailableBundleIds,
			validationAttempt,
		]
	);

	const offerOverviewProps = useMemo(
		() => ({
			bundles,
			hasFlexBizData,
			isICNRoute: isICNRoute ?? inferredICNRoute,
			isYvrRoute,
			showEligibilityBanner,
			onFlexBizRequest: confirmFlexBizSelection,
			onFlexBizOpen: () => requestFlexBizSelection(),
			flexBizDialogOpen,
			onFlexBizDialogOpenChange: setFlexBizDialogOpen,
		}),
		[
			bundles,
			confirmFlexBizSelection,
			flexBizDialogOpen,
			hasFlexBizData,
			inferredICNRoute,
			isICNRoute,
			isYvrRoute,
			requestFlexBizSelection,
			showEligibilityBanner,
		]
	);

	const passengerSelectionProps = useMemo(
		() => ({
			stageLabel,
			passengers: passengersGroups,
			bundles,
			applyToAll,
			onApplyToAllChange,
			onApplyBundleToAllChange,
			selection,
			onSelectionChange,
			onFlexBizRequest: requestFlexBizSelection,
			onLimitedBundleAttempt,
			limitedCollapsedBundleIds: limitedBundleAttemptIds,
			isBundleDisabled,
			bundleCapacities,
			validationMessage: hasNoSelectionAtAll ? null : validationMessage,
			invalidPassengerIds,
			purchaseDeadlineExceeded: isBundlePurchaseDeadlineExceeded,
			onProceed: onProceedClick,
		}),
		[
			applyToAll,
			bundleCapacities,
			bundles,
			hasNoSelectionAtAll,
			invalidPassengerIds,
			isBundleDisabled,
			isBundlePurchaseDeadlineExceeded,
			limitedBundleAttemptIds,
			onApplyBundleToAllChange,
			onApplyToAllChange,
			onLimitedBundleAttempt,
			onProceedClick,
			onSelectionChange,
			passengersGroups,
			requestFlexBizSelection,
			selection,
			stageLabel,
			validationMessage,
		]
	);

	return {
		alertProps,
		offerOverviewProps,
		passengerSelectionProps,
		confirmationChangeDialog: isConfirmationChangeFlow
			? {
					open: isConfirmationChangeDialogOpen,
					title: t("confirmation_change_dialog_title"),
					content: t("confirmation_change_dialog_description"),
					cancelLabel: t("confirmation_change_dialog_cancel_button"),
					confirmLabel: t("confirmation_change_dialog_continue_button"),
					onOpenChange: setIsConfirmationChangeDialogOpen,
					onCancel: handleConfirmationChangeCancel,
					onConfirm: handleConfirmationChangeConfirm,
				}
			: null,
	};
}
