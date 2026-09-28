"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import BundleHeading from "@/components/bundle/bundle-heading/bundle-heading";
import BundlePackageSelection from "@/components/bundle/bundle-package-selection/bundle-package-selection";
import { LoadingOverlay } from "@/components/common/loading-overlay/loading-overlay";
import {
	BUNDLE_UNAVAILABLE_ERROR_CODE,
	NO_BUNDLE_ID,
} from "@/modules/utils/constants/bundle/bundle.constants";
import {
	buildSelectedBundle,
	getBundleSegment,
	getLocaleFromParam,
	isRouteConnectedToAirport,
} from "@/modules/utils/helpers/bundle/bundle.helpers";
import { getBundleBoundaryError } from "@/modules/utils/helpers/bundle/bundle-api-error/bundle-api-error";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
	buildRetrieveOfferBundlesRequest,
	fetchBundleOffers,
	resetBundleOffers,
	selectBundleOffersData,
	selectBundleOffersError,
	selectBundleOffersIsPending,
	selectBundleOffersRequest,
	setSelectedBundles,
} from "@/store/slices/bundle-offers/bundle-offers.slice";
import { selectPassengerList } from "@/store/slices/customer-information/passenger-selector/passenger-selector";
import { selectConfirmedFlight } from "@/store/slices/flight-selection/flight-selection.slice";
import {
	clearSeatsForPassengers,
	clearServicesForPassengers,
	setBundles,
} from "@/store/slices/passenger/passenger.slice";
import type { BundleSelectionMap, BundleSelectionProps } from "@/types/bundle/bundle.types";

/** Root bundle flow shell. */
export default function BundleSelection({
	locale: localeProp,
	direction = "outbound",
	stage = direction,
}: BundleSelectionProps) {
	const dispatch = useAppDispatch();
	const params = useParams<{ locale?: string | string[] }>();
	const pathname = usePathname();
	const isPending = useAppSelector(selectBundleOffersIsPending);
	const bundleOffersData = useAppSelector(selectBundleOffersData);
	const bundleOffersRequest = useAppSelector(selectBundleOffersRequest);
	const bundleOffersError = useAppSelector(selectBundleOffersError);
	const passengers = useAppSelector(selectPassengerList);
	const storedPassengerBundles = useAppSelector((state) => state.passenger.passengers);
	const confirmedFlight = useAppSelector(selectConfirmedFlight);
	const lastRenderedPathnameRef = useRef<string | null>(null);
	const isBundleRoute = pathname?.includes("/bundles/") ?? false;
	const routeChanged = lastRenderedPathnameRef.current !== (pathname ?? null);
	lastRenderedPathnameRef.current = pathname ?? null;

	const paramsLocale = useMemo(() => {
		return getLocaleFromParam(params?.locale);
	}, [params]);

	const locale = localeProp ?? paramsLocale;

	const isICNRoute = useMemo(() => {
		return isRouteConnectedToAirport(confirmedFlight, "ICN");
	}, [confirmedFlight]);

	const requestPayload = useMemo(() => {
		if (!confirmedFlight || passengers.length === 0) {
			return undefined;
		}

		try {
			return buildRetrieveOfferBundlesRequest({
				confirmedFlight,
				passengers,
			});
		} catch {
			return undefined;
		}
	}, [confirmedFlight, passengers]);
	const hasPreloadedBundleOffers =
		requestPayload !== undefined &&
		bundleOffersData?.data !== undefined &&
		bundleOffersRequest !== undefined &&
		JSON.stringify(bundleOffersRequest) === JSON.stringify(requestPayload);

	useEffect(() => {
		if (!requestPayload || !isBundleRoute || hasPreloadedBundleOffers) {
			return;
		}

		void dispatch(
			fetchBundleOffers({
				locale,
				request: requestPayload,
			})
		);
	}, [dispatch, hasPreloadedBundleOffers, isBundleRoute, locale, requestPayload]);

	useEffect(() => {
		return () => {
			dispatch(resetBundleOffers());
		};
	}, [dispatch]);

	/** Build and persist selected bundle choices for current direction. */
	const handleProceed = (selections: {
		outbound: BundleSelectionMap;
		inbound: BundleSelectionMap;
	}) => {
		if (!confirmedFlight || !bundleOffersData?.data) return;
		const selected = buildSelectedBundle({
			passengers,
			confirmedFlight,
			...selections,
			direction,
		});
		const segment = getBundleSegment(confirmedFlight, direction);

		if (!segment) return;

		const nextSelectionByPassenger = passengers.reduce<BundleSelectionMap>(
			(selection, passenger) => {
				selection[passenger.id] =
					(direction === "inbound" ? selections.inbound : selections.outbound)[passenger.id] ??
					NO_BUNDLE_ID;
				return selection;
			},
			{}
		);

		const changedPassengerIds = passengers
			.filter((passenger) => {
				const previousBundleCode =
					storedPassengerBundles
						.find((storedPassenger) => storedPassenger.id === passenger.id)
						?.bundles?.find((bundle) => bundle.lfid === segment.lfid)?.bundleCode ?? NO_BUNDLE_ID;
				return previousBundleCode !== nextSelectionByPassenger[passenger.id];
			})
			.map((passenger) => passenger.id);

		if (changedPassengerIds.length > 0) {
			dispatch(
				clearSeatsForPassengers({
					passengerIds: changedPassengerIds,
					lfid: segment.lfid,
				})
			);

			dispatch(
				clearServicesForPassengers({
					passengerIds: changedPassengerIds,
					lfid: segment.lfid,
				})
			);
		}

		dispatch(
			setSelectedBundles({
				lfid: segment.lfid,
				selections: nextSelectionByPassenger,
			})
		);

		for (const { id, bundles } of selected.passengers) {
			const passengerTypeCode = passengers.find((p) => p.id === id)?.passengerTypeCode;

			const selectedBundles = bundles.map((bundle) => ({
				...bundle,
				bundleCategory: bundleOffersData.data
					.find((offer) => offer.lfid === bundle.lfid)
					?.bundles.find((apiBundle) => apiBundle.bundleCode === bundle.bundleCode)
					?.passengerTypes.find((pt) => pt.type === passengerTypeCode),
			}));

			dispatch(
				setBundles({
					passengerId: id,
					lfid: segment.lfid,
					bundles: selectedBundles,
				})
			);
		}
	};

	if (
		!isPending &&
		bundleOffersError &&
		isBundleRoute &&
		!routeChanged &&
		bundleOffersError.code?.toUpperCase() !== BUNDLE_UNAVAILABLE_ERROR_CODE
	) {
		throw getBundleBoundaryError(bundleOffersError);
	}

	if (isPending) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<LoadingOverlay />
			</div>
		);
	}

	return (
		<div>
			<BundleHeading stage={stage} />
			<BundlePackageSelection
				locale={locale}
				direction={direction}
				isICNRoute={isICNRoute}
				onProceed={handleProceed}
			/>
		</div>
	);
}
