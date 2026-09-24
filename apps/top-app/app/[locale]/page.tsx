import FlightSearchPage from "@/components/flight-search/flight-search";
import { getIpLocation, getRoutes } from "@/modules/services/flight-search/flight-search.services";
import {
	getAirportRoutesApiError,
	getAirportRoutesBoundaryError,
	getAirportRoutesBoundaryErrorFromCode,
} from "@/modules/utils/helpers/airport-routes/airport-routes-utils";
import { getAuthTokenBoundaryErrorFromCode } from "@/modules/utils/helpers/auth-token/auth-token-utils";
import type { RouteGroups } from "@/types/flight-search/flight-search.types";

type PageProps = {
	searchParams: Promise<{ tokenError?: string; airportRoutesError?: string }>;
};

const page = async ({ searchParams }: PageProps) => {
	const { tokenError, airportRoutesError } = await searchParams;

	if (tokenError) {
		const boundaryError = getAuthTokenBoundaryErrorFromCode(tokenError);
		if (boundaryError) {
			throw boundaryError;
		}
	}

	if (airportRoutesError) {
		const boundaryError = getAirportRoutesBoundaryErrorFromCode(airportRoutesError);
		if (boundaryError) {
			throw boundaryError;
		}
	}

	const [data, initialOrigin] = await Promise.all([
		(async (): Promise<RouteGroups> => {
			try {
				return await getRoutes();
			} catch (error) {
				const apiError = getAirportRoutesApiError(error);
				const boundaryError = getAirportRoutesBoundaryError(apiError);
				if (boundaryError) {
					throw boundaryError;
				}
				throw error;
			}
		})(),
		getIpLocation(),
	]);

	return <FlightSearchPage data={data} initialOrigin={initialOrigin} />;
};

export default page;
