import type {
	TransportServiceId,
	TransportServiceSsrCode,
} from "@/types/customize/transport-service/transport-service.types";

export const SHUTTLE_ONE_WAY_SSR_CODE: TransportServiceSsrCode = "TXIA";
export const SHUTTLE_ROUND_TRIP_SSR_CODE: TransportServiceSsrCode = "TXIB";
export const TROLLEY_7_DAYS_SSR_CODE: TransportServiceSsrCode = "TRLA";
export const TROLLEY_4_DAYS_SSR_CODE: TransportServiceSsrCode = "TRLB";
export const TROLLEY_1_DAY_SSR_CODE: TransportServiceSsrCode = "TRLC";

export const TRANSPORT_SERVICE_SSR_CODES: TransportServiceSsrCode[] = [
	"TXIA",
	"TXIB",
	"TRLA",
	"TRLB",
	"TRLC",
];
export const SHUTTLE_ONE_WAY_SERVICE_ID: TransportServiceId = "shuttle-one-way";
export const SHUTTLE_ROUND_TRIP_SERVICE_ID: TransportServiceId = "shuttle-round-trip";
export const TROLLEY_7_DAYS_SERVICE_ID: TransportServiceId = "trolley-7-days";
export const TROLLEY_4_DAYS_SERVICE_ID: TransportServiceId = "trolley-4-days";
export const TROLLEY_1_DAY_SERVICE_ID: TransportServiceId = "trolley-1-day";

export const TRANSPORT_SERVICE_ID_TO_SSR_CODE: Record<TransportServiceId, TransportServiceSsrCode> =
	{
		[SHUTTLE_ONE_WAY_SERVICE_ID]: SHUTTLE_ONE_WAY_SSR_CODE,
		[SHUTTLE_ROUND_TRIP_SERVICE_ID]: SHUTTLE_ROUND_TRIP_SSR_CODE,
		[TROLLEY_7_DAYS_SERVICE_ID]: TROLLEY_7_DAYS_SSR_CODE,
		[TROLLEY_4_DAYS_SERVICE_ID]: TROLLEY_4_DAYS_SSR_CODE,
		[TROLLEY_1_DAY_SERVICE_ID]: TROLLEY_1_DAY_SSR_CODE,
	};

export const TRANSPORT_SHUTTLE_SSR_CODES = [
	SHUTTLE_ONE_WAY_SSR_CODE,
	SHUTTLE_ROUND_TRIP_SSR_CODE,
] as const;

export const TRANSPORT_TROLLEY_SSR_CODES = [
	TROLLEY_7_DAYS_SSR_CODE,
	TROLLEY_4_DAYS_SSR_CODE,
	TROLLEY_1_DAY_SSR_CODE,
] as const;

export const TRANSPORT_OLDER_PASSENGER_TYPES: string[] = ["adult", "childA"] as const;
export const TRANSPORT_CHILD_PASSENGER_TYPES: string[] = ["childB", "childC"] as const;

export const TRANSPORT_OLDER_PRICING_PASSENGER_TYPES: string[] = ["adult", "childA"] as const;
export const TRANSPORT_CHILD_PRICING_PASSENGER_TYPES: string[] = ["childB", "childC"] as const;
