/**
 * File: extras.tsx
 * Description: Main Extras page component responsible for displaying and managing
 * ancillary amenities available for a booking segment. Handles passenger-specific
 * selections, bundled service entitlements, ancillary offer retrieval, inventory
 * validation, error dialogs, and booking flow navigation.
 * It coordinates dialog state, category filtering, availability checks,
 * and Redux updates for extras services across passengers.
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookingFooter } from "@/components/common/booking-footer/booking-footer";
import { BookingHeader } from "@/components/common/booking-header/booking-header";
import { ErrorDialog, type ErrorDialogAction } from "@/components/common/error-dialog/error-dialog";
import { LoadingOverlay } from "@/components/common/loading-overlay/loading-overlay";
import { ExtrasSection } from "@/components/extras/extras-section/extras-section";
import { FilterPills } from "@/components/extras/filter-pills/filter-pills";
import { ExtrasProductModal } from "@/components/extras/product-modal/product-modal";
import { useDepartureDeadline } from "@/modules/hooks/common/departure-deadline/departure-deadline";
import { usePassengerOrder } from "@/modules/hooks/common/passenger-order/passenger-order";
import {
	EXTRAS_CATEGORIES,
	EXTRAS_PAGE_TITLE_BY_STAGE,
} from "@/modules/utils/constants/extras/extras";
import { getAirportRouteLabel } from "@/modules/utils/helpers/airport";
import { getAncillaryOffersErrorCodeFromBoundaryError } from "@/modules/utils/helpers/common/ancillary-error-code/ancillary.errors";
import { isICNRoute } from "@/modules/utils/helpers/common/country-utils/country-utils";
import {
	type BookingFlowDirection,
	getBookingStageRoute,
	getBookingStageSegment,
	getNextBookingFlowPath,
} from "@/modules/utils/helpers/common/flow-router/flow-router";
import { detectExtrasAvailabilityIssue } from "@/modules/utils/helpers/confirmation/confirmation-extras/confirmation-extras";
import {
	checkBundlePassenger,
	createPassengerItem,
	getBundledSsrCodesForPassenger,
	getCategoriesToShow,
	getDialogSummary,
	getExtrasSegment,
	getProductsByCategory,
	getSelectAllSelections,
	getVisibleSections,
	mapAncillaryDataToProducts,
	updatePassengerSelections,
	updateSelectedCategoryIds,
} from "@/modules/utils/helpers/extras/extras.helpers";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	buildRetrieveOfferAncillariesRequest,
	fetchAncillaryOffers,
	hasPrefetchedAncillaryOffersInPageSession,
	selectAncillaryOffersDataByDirectionAndServiceCategory,
	selectAncillaryOffersErrorByDirectionAndServiceCategory,
	selectAncillaryOffersIsPendingByDirection,
} from "@/store/slices/common/ancillary-offers/ancillary-offers";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import {
	addExtrasService,
	removeExtrasService,
	selectExtrasTotal,
} from "@/store/slices/passenger/passenger.slice";
import type { PassengerSelections } from "@/types/extras/extras.type";

/** Renders the extras/ancillaries selection page for a given booking flow direction. */
export function Extras({
	locale,
	direction,
}: Readonly<{ locale: string; direction: BookingFlowDirection }>) {
	const t = useTranslations("extras_page");
	const tCommon = useTranslations("common");
	const tConfirmation = useTranslations("confirmation_page");

	const { is24HourDeadlineExceeded: hasExtrasDeadlinePassed } = useDepartureDeadline();

	const dispatch = useAppDispatch();
	const router = useRouter();
	const searchParams = useSearchParams();
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const isConfirmationChangeFlow = searchParams.get("changeFlow") === "confirmation";
	const isKorean = useMemo(
		() =>
			confirmedFlight
				? isICNRoute([
						...confirmedFlight.flights.outbound.segments,
						...(confirmedFlight.flights.inbound?.segments ?? []),
					])
				: false,
		[confirmedFlight]
	);

	const stageSegment = getBookingStageSegment({ confirmedFlight, direction });
	const routeLabel = getAirportRouteLabel(
		stageSegment === "segment2" || direction === "inbound"
			? (confirmedFlight?.flights.inbound?.segments ?? confirmedFlight?.flights.outbound.segments)
			: confirmedFlight?.flights.outbound.segments
	);
	const pageTitle = t(EXTRAS_PAGE_TITLE_BY_STAGE[stageSegment]);
	const currentRoute = getBookingStageRoute({
		section: "extras",
		confirmedFlight,
		direction,
	});
	const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(["all"]);
	const [openDialogProductId, setOpenDialogProductId] = useState<string | null>(null);
	const [passengerSelections, setPassengerSelections] = useState<PassengerSelections>({});
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isAncillaryErrorModalOpen, setIsAncillaryErrorModalOpen] = useState(false);
	const [ancillaryErrorTitle, setAncillaryErrorTitle] = useState("");
	const [ancillaryErrorMessage, setAncillaryErrorMessage] = useState("");
	const [ancillaryErrorButtonLabel, setAncillaryErrorButtonLabel] = useState<string | undefined>();
	const [ancillaryErrorAction, setAncillaryErrorAction] =
		useState<ErrorDialogAction>("returnToTop");
	const [ancillaryErrorRedirectUrl, setAncillaryErrorRedirectUrl] = useState<string | undefined>();
	const [proceedButtonVisible, setProceedButtonVisible] = useState(true);

	const [shouldShowErrorMessage, setShouldShowErrorMessage] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	const { orderedPassengers: passengerList } = usePassengerOrder();
	const orderedPassengerIds = useMemo(
		() => passengerList.map((passenger) => passenger.id),
		[passengerList]
	);

	const passengerListForRequest = useAppSelector(selectPassengerList);
	const ancillaryOffersData = useAppSelector((state) =>
		selectAncillaryOffersDataByDirectionAndServiceCategory(state, stageSegment, "AMENITIES")
	);
	const ancillaryOffersError = useAppSelector((state) =>
		selectAncillaryOffersErrorByDirectionAndServiceCategory(state, stageSegment, "AMENITIES")
	);
	const ancillaryOffersIsPending = useAppSelector((state) =>
		selectAncillaryOffersIsPendingByDirection(state, stageSegment)
	);
	const extrasProducts = useMemo(
		() =>
			mapAncillaryDataToProducts(ancillaryOffersData ?? undefined).filter(
				(product) => (product.qtyAvailable ?? 0) > 0
			),
		[ancillaryOffersData]
	);

	const currentSegment = getExtrasSegment(confirmedFlight, direction);

	const currentSegmentLfid = currentSegment?.lfid;

	const total = useAppSelector((state) => selectExtrasTotal(state, currentSegmentLfid));

	const bundledSsrCodesByPassengerId = useMemo(
		() =>
			Object.fromEntries(
				passengerList.map((passenger) => [
					passenger.id,
					getBundledSsrCodesForPassenger(passenger, currentSegmentLfid),
				])
			) as Record<string, Set<string>>,
		[passengerList, currentSegmentLfid]
	);

	const bundledPassengerIdsByProductId = useMemo(() => {
		const result: Record<string, string[]> = {};

		for (const product of extrasProducts) {
			result[product.id] = passengerList
				.filter((passenger) => bundledSsrCodesByPassengerId[passenger.id]?.has(product.ssrCode))
				.map((passenger) => passenger.id);
		}

		return result;
	}, [bundledSsrCodesByPassengerId, extrasProducts, passengerList]);

	const bundledProductIds = useMemo(
		() =>
			Object.entries(bundledPassengerIdsByProductId)
				.filter(([, ids]) => ids.length > 0)
				.map(([productId]) => productId),
		[bundledPassengerIdsByProductId]
	);

	const displayExtrasProducts = useMemo(
		() =>
			extrasProducts.map((product) =>
				bundledProductIds.includes(product.id)
					? { ...product, price: 0, inPremiumBundle: true }
					: { ...product, inPremiumBundle: false }
			),
		[bundledProductIds, extrasProducts]
	);

	const ancillaryRequest = useMemo(() => {
		if (!confirmedFlight || !currentSegment || !passengerListForRequest.length) {
			return undefined;
		}

		try {
			return buildRetrieveOfferAncillariesRequest({
				confirmedFlight,
				segment: currentSegment,
				passengers: passengerListForRequest,
				serviceCategory: "AMENITIES",
			});
		} catch {
			return undefined;
		}
	}, [confirmedFlight, currentSegment, passengerListForRequest]);

	// Persisted offers rehydrate after a reload, so only reuse data prefetched in this page session.
	const shouldReusePrefetchedAncillaries =
		isConfirmationChangeFlow &&
		hasPrefetchedAncillaryOffersInPageSession(stageSegment, "AMENITIES");

	const isBundlePassenger = checkBundlePassenger(passengerList, currentSegmentLfid);
	const hasSeededBundledServicesRef = useRef(false);

	useEffect(() => {
		if (!extrasProducts.length) {
			hasSeededBundledServicesRef.current = false;
			return;
		}
		if (hasSeededBundledServicesRef.current) return;
		hasSeededBundledServicesRef.current = true;

		for (const product of extrasProducts) {
			const bundledPassengerIds = bundledPassengerIdsByProductId[product.id] ?? [];
			for (const passengerId of bundledPassengerIds) {
				const passenger = passengerList.find((p) => p.id === passengerId);
				const passengerBundleCode =
					passenger?.bundles?.find((b) => b.lfid === currentSegmentLfid)?.bundleCode ?? "";

				dispatch(
					addExtrasService({
						passengerId,
						service: {
							ssrCode: product.ssrCode,
							amount: product.price,
							lfid: product.lfid,
							description: product.description ?? product.name,
							qtyAvailable: product.qtyAvailable,
							cutOffHours: product.cutOffHours,
							maxCountServiceLevel: product.maxCountServiceLevel,
							categoryId: product.numericCategoryId,
							passengerType: product.passengerType,
							serviceID: product.serviceID,
							pfid: product.pfid ?? currentSegment?.pfid ?? 0,
							chargeComment: "",
							bundleCode: passengerBundleCode,
							applicableAmount: 0,
						},
					})
				);
			}
		}
	}, [
		dispatch,
		extrasProducts,
		bundledPassengerIdsByProductId,
		passengerList,
		currentSegment?.pfid,
		currentSegmentLfid,
	]);

	useEffect(() => {
		if (!ancillaryRequest || hasExtrasDeadlinePassed || shouldReusePrefetchedAncillaries) {
			return;
		}
		void dispatch(fetchAncillaryOffers({ scope: stageSegment, request: ancillaryRequest }));
	}, [
		dispatch,
		ancillaryRequest,
		stageSegment,
		hasExtrasDeadlinePassed,
		shouldReusePrefetchedAncillaries,
	]);

	const selectedProductIds = useMemo(
		() =>
			extrasProducts
				.filter(
					(product) =>
						bundledProductIds.includes(product.id) ||
						passengerList.some((p) =>
							(p.services?.extras ?? []).some(
								(s) => s.ssrCode === product.ssrCode && s.lfid === currentSegmentLfid
							)
						)
				)
				.map((product) => product.id),
		[extrasProducts, bundledProductIds, passengerList, currentSegmentLfid]
	);

	const passengers = useMemo(
		() => passengerList.map((p) => createPassengerItem(p, tCommon)),
		[passengerList, tCommon]
	);

	/** Updates the active category filter when a pill is selected. */
	const handleCategoryChange = (categoryId: string) => {
		setSelectedCategoryIds((prev) => updateSelectedCategoryIds(prev, categoryId));
	};

	const triggerRef = useRef<HTMLElement | null>(null);

	/** Opens the product dialog and initialises passenger selections from stored state. */
	const handleCardClick = (productId: string) => {
		triggerRef.current = document.activeElement as HTMLElement;
		setOpenDialogProductId(productId);
		setCurrentImageIndex(0);
		const product = extrasProducts.find((p) => p.id === productId);
		const bundledPassengerIdSet = new Set(bundledPassengerIdsByProductId[productId] ?? []);
		const storedSelections: Record<string, boolean> = {};
		if (product) {
			for (const p of passengerList) {
				storedSelections[p.id] =
					bundledPassengerIdSet.has(p.id) ||
					(p.services?.extras ?? []).some(
						(s) => s.ssrCode === product.ssrCode && s.lfid === currentSegmentLfid
					);
			}
		}
		setPassengerSelections((prev) => ({
			...prev,
			[productId]: storedSelections,
		}));
	};

	/** Toggles a single passenger selection in the open product dialog. */
	const handlePassengerChange = (passengerId: string, checked: boolean) => {
		if (!openDialogProductId) return;

		const selectedProduct = extrasProducts.find((product) => product.id === openDialogProductId);
		const bundledPassengerIdSet = new Set(
			bundledPassengerIdsByProductId[openDialogProductId] ?? []
		);
		const availableQty = selectedProduct?.qtyAvailable ?? passengers.length;

		setPassengerSelections((prev) => {
			const productSelections = prev[openDialogProductId] || {};
			return {
				...prev,
				[openDialogProductId]: updatePassengerSelections(
					productSelections,
					passengerId,
					checked,
					Array.from(bundledPassengerIdSet),
					availableQty
				),
			};
		});
	};

	/** Selects or deselects all eligible passengers in the open product dialog. */
	const handleSelectAll = (checked: boolean) => {
		if (!openDialogProductId) return;

		const selectedProduct = extrasProducts.find((product) => product.id === openDialogProductId);
		const bundledPassengerIdSet = new Set(
			bundledPassengerIdsByProductId[openDialogProductId] ?? []
		);
		const availableQty = selectedProduct?.qtyAvailable ?? passengers.length;

		const newSelections = getSelectAllSelections(
			passengers,
			Array.from(bundledPassengerIdSet),
			availableQty,
			checked
		);

		setPassengerSelections((prev) => ({
			...prev,
			[openDialogProductId]: newSelections,
		}));
	};

	/** Commits the dialog passenger selections to the Redux store and closes the dialog. */
	const handleConfirmDialog = () => {
		if (openDialogProductId) {
			const currentSelections = passengerSelections[openDialogProductId] || {};
			const selectedProduct = extrasProducts.find((product) => product.id === openDialogProductId);
			const bundledPassengerIdSet = new Set(
				bundledPassengerIdsByProductId[openDialogProductId] ?? []
			);

			if (selectedProduct) {
				for (const [passengerId, isSelected] of Object.entries(currentSelections)) {
					if (isSelected) {
						if (bundledPassengerIdSet.has(passengerId)) {
							dispatch(
								removeExtrasService({
									passengerId,
									lfid: selectedProduct.lfid,
									ssrCode: selectedProduct.ssrCode,
								})
							);
							continue;
						}

						dispatch(
							addExtrasService({
								passengerId,
								service: {
									ssrCode: selectedProduct.ssrCode,
									amount: selectedProduct.price,
									applicableAmount: selectedProduct.price,
									lfid: selectedProduct.lfid,
									description: selectedProduct.description ?? selectedProduct.name,
									qtyAvailable: selectedProduct.qtyAvailable,
									cutOffHours: selectedProduct.cutOffHours,
									maxCountServiceLevel: selectedProduct.maxCountServiceLevel,
									categoryId: selectedProduct.numericCategoryId,
									passengerType: selectedProduct.passengerType,
									serviceID: selectedProduct.serviceID,
									pfid: selectedProduct.pfid ?? currentSegment?.pfid ?? 0,
									chargeComment: "",
									bundleCode: "",
								},
							})
						);
					} else {
						dispatch(
							removeExtrasService({
								passengerId,
								lfid: selectedProduct.lfid,
								ssrCode: selectedProduct.ssrCode,
							})
						);
					}
				}
			}

			setOpenDialogProductId(null);
		}
	};

	/** Closes the product dialog without saving changes. */
	const handleCloseDialog = () => {
		setOpenDialogProductId(null);
	};

	/** Navigates to the next step in the booking flow. */
	const handleProceed = () => {
		if (isConfirmationChangeFlow) {
			router.back();
			return;
		}

		router.push(
			getNextBookingFlowPath({
				locale,
				confirmedFlight,
				currentRoute,
			})
		);
	};

	const categoriesToShow = getCategoriesToShow(selectedCategoryIds, EXTRAS_CATEGORIES.slice(1));

	const visibleSections = getVisibleSections(
		EXTRAS_CATEGORIES.slice(1),
		categoriesToShow,
		(categoryId) => getProductsByCategory(displayExtrasProducts, categoryId)
	);

	const dialogProduct = openDialogProductId
		? (extrasProducts.find((product) => product.id === openDialogProductId) ?? null)
		: null;

	const bundledPassengerIdsForDialog = openDialogProductId
		? (bundledPassengerIdsByProductId[openDialogProductId] ?? [])
		: [];

	const dialogPassengerSelections = openDialogProductId
		? passengerSelections[openDialogProductId] || {}
		: {};

	const dialogSummary = getDialogSummary(
		dialogProduct,
		dialogPassengerSelections,
		bundledPassengerIdsForDialog,
		passengers.length - bundledPassengerIdsForDialog.length
	);

	const { dialogTotal, isDialogSelectionFull, shouldShowOutOfStockAlert } = dialogSummary;

	useEffect(() => {
		if (isAncillaryErrorModalOpen) {
			return;
		}

		// Reset transient error/modal state on every evaluation so stale values from a
		// previously visited route/segment (e.g. no offers) don't leak into a segment
		// that does have valid data, since this component instance can be reused across
		// client-side navigations instead of remounting.
		setShouldShowErrorMessage(false);
		setErrorMessage("");
		setProceedButtonVisible(true);
		setIsAncillaryErrorModalOpen(false);
		setAncillaryErrorTitle("");
		setAncillaryErrorMessage("");
		setAncillaryErrorButtonLabel(undefined);
		setAncillaryErrorAction("returnToTop");
		setAncillaryErrorRedirectUrl(undefined);

		const showAncillaryModal = (
			title: string,
			message: string,
			options?: {
				buttonLabel?: string;
				action?: ErrorDialogAction;
				redirectUrl?: string;
			}
		) => {
			setAncillaryErrorTitle(title);
			setAncillaryErrorMessage(message);
			setAncillaryErrorButtonLabel(options?.buttonLabel);
			setAncillaryErrorAction(options?.action ?? "returnToTop");
			setAncillaryErrorRedirectUrl(options?.redirectUrl);
			setProceedButtonVisible(false);
			setIsAncillaryErrorModalOpen(true);
		};

		const removeCurrentSegmentExtras = (
			extrasToRemove: Array<{ passengerId: string; lfid: number; ssrCode: string }>
		) => {
			for (const extraToRemove of extrasToRemove) {
				dispatch(removeExtrasService(extraToRemove));
			}
		};

		// 1. Premium bundle passenger within 24-hour deadline - Modal
		if (!isKorean && isBundlePassenger && hasExtrasDeadlinePassed) {
			showAncillaryModal(
				t("error_labels.service_unavailable_title"),
				t("error_labels.bundle_ancillary_deadline_error")
			);
			return;
		}

		// 2. General 24-hour deadline warning
		if (hasExtrasDeadlinePassed) {
			setShouldShowErrorMessage(true);
			setErrorMessage(t("error_labels.deadline_error"));
		}

		if (!ancillaryOffersIsPending && ancillaryOffersData && currentSegmentLfid !== undefined) {
			const issue = detectExtrasAvailabilityIssue({
				ancillaryData: ancillaryOffersData,
				storedPassengers: passengerList,
				orderedPassengerIds,
				lfid: currentSegmentLfid,
			});

			if (issue.type === "bundle-extra-unavailable") {
				showAncillaryModal(
					tConfirmation("error_labels.extras_bundle_unavailable_title"),
					tConfirmation("error_labels.extras_bundle_unavailable_content"),
					{
						buttonLabel: tConfirmation("error_labels.extras_bundle_unavailable_button"),
						action: "returnToTop",
						redirectUrl: `/${locale}`,
					}
				);
				return;
			}

			if (issue.type === "selected-extra-unavailable") {
				removeCurrentSegmentExtras(issue.extrasToRemove);
				showAncillaryModal(
					tConfirmation("error_labels.extras_cancelled_title"),
					`${tConfirmation("error_labels.extras_cancelled_content")}\n\n${issue.unavailableExtras
						.map((entry) => `${entry.extraName} : ${entry.passengerName}`)
						.join("\n")}`,
					{
						buttonLabel: tConfirmation("error_labels.extras_cancelled_button"),
						action: "close",
					}
				);
				return;
			}
		}

		// 3. No ancillary offers available (only once a response has actually been received,
		// otherwise this would false-positive while the initial fetch is still in flight)
		if (
			!ancillaryOffersIsPending &&
			ancillaryOffersData !== undefined &&
			extrasProducts.length === 0
		) {
			setShouldShowErrorMessage(true);
			setErrorMessage(t("error_labels.empty_response"));
		}

		if (!ancillaryOffersError) return;

		const errorCode = getAncillaryOffersErrorCodeFromBoundaryError(new Error(ancillaryOffersError));
		const ignoredErrorCodes = ["NEXUZR004E102", "NEXUZCMNE004"];

		// 4. There are no valid ancillaries to send after all the logic and validation (out of stock).
		if (errorCode === "NEXUZR004E102") {
			showAncillaryModal(
				t("error_labels.service_unavailable_title"),
				t("error_labels.service_unavailable_description")
			);
		}
		// 5. NEXUZCMNE004: Empty response error
		else if (errorCode === "NEXUZCMNE004") {
			setShouldShowErrorMessage(true);
			setErrorMessage(t("error_labels.empty_response"));
		} else if (
			errorCode !== null &&
			!ancillaryOffersIsPending &&
			!ignoredErrorCodes.includes(errorCode)
		) {
			throw new Error();
		}
	}, [
		dispatch,
		ancillaryOffersError,
		ancillaryOffersIsPending,
		ancillaryOffersData,
		currentSegmentLfid,
		extrasProducts,
		isKorean,
		hasExtrasDeadlinePassed,
		isBundlePassenger,
		locale,
		orderedPassengerIds,
		passengerList,
		isAncillaryErrorModalOpen,
		t,
		tConfirmation,
	]);

	if (ancillaryOffersIsPending) {
		return <LoadingOverlay />;
	}

	return (
		<div
			className="flex flex-col gap-4 px-4 pb-10 md:px-0"
			aria-busy={ancillaryOffersIsPending || undefined}
		>
			<div className="flex flex-col gap-4 md:gap-6">
				{/* Header */}
				<BookingHeader title={pageTitle} description={t("choose_ancillary_services")} />

				{/* filter pills */}
				<FilterPills
					title={pageTitle}
					onCategoryChange={handleCategoryChange}
					selectedCategoryIds={selectedCategoryIds}
				/>
			</div>

			<div className="flex flex-col gap-4 md:gap-6">
				{/* content */}
				{shouldShowErrorMessage ? (
					<div className="flex h-57.5 items-center justify-center px-4 md:h-100">
						<p className="text-center text-[12px] text-secondary-400 leading-5">{errorMessage}</p>
					</div>
				) : (
					<div className="flex min-h-57.5 flex-col items-start gap-2">
						{visibleSections.map((section) => (
							<ExtrasSection
								key={section.id}
								bundledPassengerIdsByProductId={bundledPassengerIdsByProductId}
								title={section.title}
								products={section.products}
								selectedProductIds={selectedProductIds}
								onSelectProduct={() => {}}
								onCardClick={handleCardClick}
							/>
						))}
					</div>
				)}

				{/* footer */}
				<div className="bottom-0">
					<BookingFooter
						amountValue={total}
						onProceed={handleProceed}
						disabled={ancillaryOffersIsPending || !proceedButtonVisible}
					/>
				</div>
			</div>

			<ExtrasProductModal
				open={Boolean(openDialogProductId)}
				product={dialogProduct}
				routeLabel={routeLabel}
				currentImageIndex={currentImageIndex}
				passengers={passengers}
				passengerSelections={dialogPassengerSelections}
				bundledPassengerIds={bundledPassengerIdsForDialog}
				isDialogSelectionFull={isDialogSelectionFull}
				dialogTotal={dialogTotal}
				shouldShowOutOfStockAlert={shouldShowOutOfStockAlert}
				onClose={handleCloseDialog}
				onCloseAutoFocus={(e) => {
					if (triggerRef.current) {
						e.preventDefault();
						triggerRef.current.focus();
						triggerRef.current = null;
					}
				}}
				onPreviousImage={() => {
					const imageCount =
						dialogProduct?.images && dialogProduct.images.length > 0
							? dialogProduct.images.length
							: 2;
					setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount);
				}}
				onNextImage={() => {
					const imageCount =
						dialogProduct?.images && dialogProduct.images.length > 0
							? dialogProduct.images.length
							: 2;
					setCurrentImageIndex((prev) => (prev + 1) % imageCount);
				}}
				onPassengerChange={handlePassengerChange}
				onSelectAllChange={handleSelectAll}
				onConfirm={handleConfirmDialog}
			/>

			<ErrorDialog
				title={ancillaryErrorTitle}
				open={isAncillaryErrorModalOpen}
				onOpenChange={setIsAncillaryErrorModalOpen}
				content={ancillaryErrorMessage}
				buttonLabel={ancillaryErrorButtonLabel}
				action={ancillaryErrorAction}
				redirectUrl={ancillaryErrorRedirectUrl}
				onReturnToTop={() => {
					window.location.href = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "/";
				}}
			/>
		</div>
	);
}
