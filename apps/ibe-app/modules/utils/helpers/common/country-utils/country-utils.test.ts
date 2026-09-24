import { describe, expect, it } from "vitest";
import {
	BKK_AIRPORT_CODE,
	CANADA_AIRPORT_CODES,
	getRouteType,
	HNL_AIRPORT_CODE,
	ICN_AIRPORT_CODE,
	isAnyCANADARoute,
	isAnyICNRoute,
	isAnyUSRoute,
	isDestinationCanada,
	isDestinationHNLfromNRT,
	isDestinationNRTfromHNL,
	isDestinationThai,
	isDestinationUS,
	isICNRoute,
	isKoreanFlight,
	isKoreanFlightNrtDeparture,
	isLoungeServiceRouteEnabled,
	isNRTToICNRoute,
	isOriginfromLoungeApplicableCountry,
	isTransportServiceRouteEnabled,
	isUSDeparture,
	NRT_AIRPORT_CODE,
	SIN_AIRPORT_CODE,
	THAI_AIRPORT_CODES,
	US_AIRPORT_CODES,
} from "@/modules/utils/helpers/common/country-utils/country-utils";

type Segment = { origin: string; destination: string };

describe("constants", () => {
	it("exports US airport codes", () => {
		expect(US_AIRPORT_CODES).toContain("HNL");
		expect(US_AIRPORT_CODES).toContain("SFO");
	});

	it("exports THAI airport codes", () => {
		expect(THAI_AIRPORT_CODES).toContain("BKK");
	});

	it("exports CANADA airport codes", () => {
		expect(CANADA_AIRPORT_CODES).toContain("YVR");
	});

	it("exports individual airport constants", () => {
		expect(NRT_AIRPORT_CODE).toBe("NRT");
		expect(SIN_AIRPORT_CODE).toBe("SIN");
		expect(BKK_AIRPORT_CODE).toBe("BKK");
		expect(ICN_AIRPORT_CODE).toBe("ICN");
		expect(HNL_AIRPORT_CODE).toBe("HNL");
	});
});

describe("getRouteType", () => {
	it("returns US for US airport codes", () => {
		expect(getRouteType("HNL")).toBe("US");
		expect(getRouteType("SFO")).toBe("US");
		expect(getRouteType("LAX")).toBe("US");
	});

	it("returns THAI for BKK", () => {
		expect(getRouteType("BKK")).toBe("THAI");
	});

	it("returns CANADA for YVR", () => {
		expect(getRouteType("YVR")).toBe("CANADA");
	});

	it("returns OTHER for unrecognised codes", () => {
		expect(getRouteType("NRT")).toBe("OTHER");
		expect(getRouteType("ICN")).toBe("OTHER");
		expect(getRouteType("XXX")).toBe("OTHER");
	});
});

describe("isDestinationUS", () => {
	it("returns true when any segment destination is a US airport", () => {
		const segments: Segment[] = [
			{ origin: "NRT", destination: "HNL" },
			{ origin: "HNL", destination: "NRT" },
		];
		expect(isDestinationUS(segments)).toBe(true);
	});

	it("returns false when no segment destination is a US airport", () => {
		const segments: Segment[] = [{ origin: "NRT", destination: "ICN" }];
		expect(isDestinationUS(segments)).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isDestinationUS([])).toBe(false);
	});
});

describe("isDestinationThai", () => {
	it("returns true when destination is BKK", () => {
		expect(isDestinationThai([{ origin: "NRT", destination: "BKK" }])).toBe(true);
	});

	it("returns false when destination is not a Thai airport", () => {
		expect(isDestinationThai([{ origin: "NRT", destination: "ICN" }])).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isDestinationThai([])).toBe(false);
	});
});

describe("isDestinationCanada", () => {
	it("returns true when destination is YVR", () => {
		expect(isDestinationCanada([{ origin: "NRT", destination: "YVR" }])).toBe(true);
	});

	it("returns false when destination is not a Canadian airport", () => {
		expect(isDestinationCanada([{ origin: "NRT", destination: "ICN" }])).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isDestinationCanada([])).toBe(false);
	});
});

describe("isAnyUSRoute", () => {
	it("returns true when a segment origin is a US airport", () => {
		expect(isAnyUSRoute([{ origin: "HNL", destination: "NRT" }])).toBe(true);
	});

	it("returns true when a segment destination is a US airport", () => {
		expect(isAnyUSRoute([{ origin: "NRT", destination: "HNL" }])).toBe(true);
	});

	it("returns false when no segment involves a US airport", () => {
		expect(isAnyUSRoute([{ origin: "NRT", destination: "ICN" }])).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isAnyUSRoute([])).toBe(false);
	});
});

describe("isAnyCANADARoute", () => {
	it("returns true when a segment origin is YVR", () => {
		expect(isAnyCANADARoute([{ origin: "YVR", destination: "NRT" }])).toBe(true);
	});

	it("returns true when a segment destination is YVR", () => {
		expect(isAnyCANADARoute([{ origin: "NRT", destination: "YVR" }])).toBe(true);
	});

	it("returns false when no segment involves a Canadian airport", () => {
		expect(isAnyCANADARoute([{ origin: "NRT", destination: "ICN" }])).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isAnyCANADARoute([])).toBe(false);
	});
});

describe("isAnyICNRoute", () => {
	it("returns true when origin is ICN", () => {
		expect(isAnyICNRoute([{ origin: "ICN", destination: "NRT" }])).toBe(true);
	});

	it("returns true when destination is ICN", () => {
		expect(isAnyICNRoute([{ origin: "NRT", destination: "ICN" }])).toBe(true);
	});

	it("returns false when no segment involves ICN", () => {
		expect(isAnyICNRoute([{ origin: "NRT", destination: "HNL" }])).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isAnyICNRoute([])).toBe(false);
	});
});

describe("isICNRoute", () => {
	it("delegates to isAnyICNRoute", () => {
		expect(isICNRoute([{ origin: "ICN", destination: "NRT" }])).toBe(true);
		expect(isICNRoute([{ origin: "NRT", destination: "HNL" }])).toBe(false);
	});
});

describe("isUSDeparture", () => {
	it("returns true when the first segment departs from a US airport", () => {
		expect(isUSDeparture([{ origin: "HNL", destination: "NRT" }])).toBe(true);
	});

	it("returns false when the first segment departs from a non-US airport", () => {
		expect(isUSDeparture([{ origin: "NRT", destination: "HNL" }])).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isUSDeparture([])).toBe(false);
	});
});

describe("isDestinationHNLfromNRT", () => {
	it("returns true for NRT -> HNL", () => {
		expect(isDestinationHNLfromNRT("NRT", "HNL")).toBe(true);
	});

	it("returns false when origin is not NRT", () => {
		expect(isDestinationHNLfromNRT("ICN", "HNL")).toBe(false);
	});

	it("returns false when destination is not HNL", () => {
		expect(isDestinationHNLfromNRT("NRT", "SFO")).toBe(false);
	});

	it("returns false when both are undefined", () => {
		expect(isDestinationHNLfromNRT(undefined, undefined)).toBe(false);
	});
});

describe("isDestinationNRTfromHNL", () => {
	it("returns true for HNL -> NRT", () => {
		expect(isDestinationNRTfromHNL("HNL", "NRT")).toBe(true);
	});

	it("returns false when origin is not HNL", () => {
		expect(isDestinationNRTfromHNL("ICN", "NRT")).toBe(false);
	});

	it("returns false when destination is not NRT", () => {
		expect(isDestinationNRTfromHNL("HNL", "ICN")).toBe(false);
	});

	it("returns false when both are undefined", () => {
		expect(isDestinationNRTfromHNL(undefined, undefined)).toBe(false);
	});
});

describe("isTransportServiceRouteEnabled", () => {
	it("returns true for NRT -> HNL", () => {
		expect(isTransportServiceRouteEnabled("NRT", "HNL")).toBe(true);
	});

	it("returns true for HNL -> NRT", () => {
		expect(isTransportServiceRouteEnabled("HNL", "NRT")).toBe(true);
	});

	it("returns false for any other route", () => {
		expect(isTransportServiceRouteEnabled("NRT", "ICN")).toBe(false);
		expect(isTransportServiceRouteEnabled("ICN", "NRT")).toBe(false);
	});

	it("returns false when both are undefined", () => {
		expect(isTransportServiceRouteEnabled(undefined, undefined)).toBe(false);
	});
});

describe("isNRTToICNRoute", () => {
	it("returns true when first segment is NRT -> ICN", () => {
		expect(isNRTToICNRoute([{ origin: "NRT", destination: "ICN" }])).toBe(true);
	});

	it("returns false when first segment is not NRT -> ICN", () => {
		expect(isNRTToICNRoute([{ origin: "ICN", destination: "NRT" }])).toBe(false);
	});

	it("returns false for empty segments", () => {
		expect(isNRTToICNRoute([])).toBe(false);
	});
});

describe("isOriginfromLoungeApplicableCountry", () => {
	it("returns true for NRT", () => {
		expect(isOriginfromLoungeApplicableCountry("NRT")).toBe(true);
	});

	it("returns true for SIN", () => {
		expect(isOriginfromLoungeApplicableCountry("SIN")).toBe(true);
	});

	it("returns true for HNL", () => {
		expect(isOriginfromLoungeApplicableCountry("HNL")).toBe(true);
	});

	it("returns true for BKK", () => {
		expect(isOriginfromLoungeApplicableCountry("BKK")).toBe(true);
	});

	it("returns false for ICN", () => {
		expect(isOriginfromLoungeApplicableCountry("ICN")).toBe(false);
	});

	it("returns false for undefined", () => {
		expect(isOriginfromLoungeApplicableCountry(undefined)).toBe(false);
	});
});

describe("isLoungeServiceRouteEnabled", () => {
	it("returns true for NRT origin", () => {
		expect(isLoungeServiceRouteEnabled("NRT")).toBe(true);
	});

	it("returns false for ICN origin", () => {
		expect(isLoungeServiceRouteEnabled("ICN")).toBe(false);
	});

	it("returns false for undefined", () => {
		expect(isLoungeServiceRouteEnabled(undefined)).toBe(false);
	});
});

describe("isKoreanFlightNrtDeparture", () => {
	it("returns true for NRT -> ICN", () => {
		expect(isKoreanFlightNrtDeparture("NRT", "ICN")).toBe(true);
	});

	it("returns false for ICN -> NRT", () => {
		expect(isKoreanFlightNrtDeparture("ICN", "NRT")).toBe(false);
	});

	it("returns false for unrelated routes", () => {
		expect(isKoreanFlightNrtDeparture("HNL", "NRT")).toBe(false);
	});
});

describe("isKoreanFlight", () => {
	it("returns true when source is ICN (Korean flight)", () => {
		expect(isKoreanFlight("ICN", "NRT")).toBe(true);
	});

	it("returns true when source is NRT (non-Korean flight condition)", () => {
		expect(isKoreanFlight("NRT", "HNL")).toBe(true);
	});

	it("returns true when source is not ICN and destination is not ICN", () => {
		expect(isKoreanFlight("HNL", "NRT")).toBe(true);
	});

	it("returns false when source is not ICN but destination is ICN", () => {
		expect(isKoreanFlight("HNL", "ICN")).toBe(false);
	});
});
