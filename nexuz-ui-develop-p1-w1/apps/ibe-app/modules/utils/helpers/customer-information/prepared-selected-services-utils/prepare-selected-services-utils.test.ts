/**
 * File: prepare-selected-services-utils.test.ts
 * Classification: Helper
 * Description: Tests for the prepareSelectedServices function which converts
 * passenger non-chargeable data into grouped selected service state.
 */

import { describe, expect, it } from "vitest";
import { prepareSelectedServices } from "@/modules/utils/helpers/customer-information/prepared-selected-services-utils/prepare-selected-services-utils";
import type { SelectedSegment } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	AssistanceService,
	DogForm,
	NonChargeable,
	Passenger,
} from "@/types/customer-information/customer-information.types";

function makeAssistanceService(overrides: Partial<AssistanceService> = {}): AssistanceService {
	return {
		requestingAssistance: false,
		canManagePersonalNeeds: "",
		boardingWithAccompanion: "",
		accompanyingPersonName: "",
		assistanceReasons: [],
		canWalk: "",
		canGoUpDownStairs: "",
		needsOnboardWheelchair: "",
		reasonForWheelchair: "",
		bringingOwnWheelchair: "no",
		wheelchairType: "",
		wheelchairBatteryType: "",
		wheelchairBatteryRemovable: "",
		isFoldable: "",
		wheelchairHeight: "",
		wheelchairWidth: "",
		wheelchairDepth: "",
		wheelchairWeight: "",
		...overrides,
	};
}

function makeDogForm(overrides: Partial<DogForm> = {}): DogForm {
	return {
		accompaniedByServiceDog: false,
		serviceDogType: "",
		serviceDogBreed: "",
		serviceDogWeight: "",
		serviceDogCagePresence: "",
		serviceDogCageHeight: "",
		serviceDogCageWidth: "",
		serviceDogCageDepth: "",
		serviceDogCageWeight: "",
		...overrides,
	};
}

function makeNonChargeable(overrides: Partial<NonChargeable> = {}): NonChargeable {
	return {
		travelDocument: {
			hasTravelDocs: false,
			documentType: "",
			documentNumber: "",
			documentExpiryDate: { year: "", month: "", day: "" },
			issuingCountry: "",
			purposeOfTravel: "",
			evusObtained: false,
		},
		isPregnant: false,
		pregnancyWeeks: "",
		assistanceService: makeAssistanceService(),
		dogForm: makeDogForm(),
		...overrides,
	};
}

function makePassenger(overrides: Partial<Passenger> = {}): Passenger {
	return {
		id: "pax-1",
		passengerTypeCode: "adult",
		title: "MR",
		firstName: "JOHN",
		lastName: "SMITH",
		middleName: "",
		dateOfBirth: { year: "1990", month: "01", day: "15" },
		gender: "male",
		weight: "",
		height: "",
		nationality: "JPN",
		isCompleted: true,
		contactInformation: {
			countryCode: "+81",
			phoneNumber: "1234567890",
			email: "john@example.com",
		},
		emergencyContact: {
			countryCode: "+1",
			phoneNumber: "0987654321",
		},
		apisInfo: {
			passportNumber: "AB123456",
			passportExpiryDate: { year: "2030", month: "12", day: "31" },
			nationality: "JPN",
			countryOfResidence: "USA",
			destinationAddress: {},
		},
		nonChargeable: makeNonChargeable(),
		...overrides,
	} as Passenger;
}

function makeSelectedSegment(overrides: Partial<SelectedSegment> = {}): SelectedSegment {
	return {
		pfid: 1,
		lfid: 101,
		carrierCode: "ZG",
		origin: "NRT",
		destination: "HNL",
		flightNumber: "100",
		scheduledDepartureArrivalDateTime: {
			departureDateTime: "2026-10-01T10:00:00",
			departureDateTimeOffset: "+09:00",
			arrivalDateTime: "2026-10-01T18:00:00",
			arrivalDateTimeOffset: "-10:00",
		},
		flightTime: "07:00",
		selectedCabin: "Y",
		fareDetails: [],
		...overrides,
	};
}

const defaultFlightSegments = [makeSelectedSegment()];

const prepareServices = (passengers: Passenger[]) =>
	prepareSelectedServices(passengers, defaultFlightSegments);

const flattenSelectedServices = (state: ReturnType<typeof prepareSelectedServices>) =>
	state.passengers.flatMap((passenger) => passenger.services);

describe("prepareSelectedServices", () => {
	it("returns empty passenger groups when there are no qualifying passengers", () => {
		expect(prepareServices([])).toEqual({ passengers: [] });
		expect(prepareServices([makePassenger({ nonChargeable: undefined } as any)])).toEqual({
			passengers: [],
		});
	});

	it("groups services by passenger and preserves service details", () => {
		const passenger = makePassenger({
			nonChargeable: makeNonChargeable({
				isPregnant: true,
				pregnancyWeeks: "20",
				assistanceService: makeAssistanceService({
					requestingAssistance: true,
					assistanceReasons: ["visual", "hearing"],
				}),
			}),
		});

		const result = prepareServices([passenger]);
		const services = flattenSelectedServices(result);

		expect(result.passengers).toHaveLength(1);
		expect(services.some((service) => service.ssrCode === "PRGN")).toBe(true);
		expect(services.some((service) => service.ssrCode === "BLND")).toBe(true);
		expect(services.some((service) => service.ssrCode === "DEAF")).toBe(true);
	});

	it("creates wheelchair and battery comments", () => {
		const passenger = makePassenger({
			nonChargeable: makeNonChargeable({
				assistanceService: makeAssistanceService({
					requestingAssistance: true,
					assistanceReasons: ["wheelchair"],
					canWalk: "yes",
					canGoUpDownStairs: "yes",
					bringingOwnWheelchair: "yes",
					wheelchairType: "electric",
					wheelchairBatteryType: "lead-acid",
					wheelchairBatteryRemovable: "no",
				}),
			}),
		});

		const service = flattenSelectedServices(prepareServices([passenger])).find(
			(selected) => selected.ssrCode === "WBWC"
		);

		expect(service?.chargeComment).toContain("Unable to remove battery");
	});

	it("creates manual wheelchair and personal-needs comments", () => {
		const passenger = makePassenger({
			nonChargeable: makeNonChargeable({
				assistanceService: makeAssistanceService({
					requestingAssistance: true,
					assistanceReasons: ["wheelchair"],
					canManagePersonalNeeds: "no",
					boardingWithAccompanion: "yes",
					accompanyingPersonName: "  Alex  ",
					canWalk: "no",
					needsOnboardWheelchair: "yes",
					bringingOwnWheelchair: "yes",
					wheelchairType: "manual",
					reasonForWheelchair: "injury",
					isFoldable: "yes",
				}),
			}),
		});

		const services = flattenSelectedServices(prepareServices([passenger]));

		expect(services.some((service) => service.ssrCode === "WCHC")).toBe(true);
		expect(services.some((service) => service.ssrCode === "MPWC")).toBe(true);
		expect(services.find((service) => service.ssrCode === "WCHC")?.chargeComment).toContain(
			"Unable to manage personal needs"
		);
		expect(services.find((service) => service.ssrCode === "WCHC")?.chargeComment).toContain(
			"With escort Alex"
		);
		expect(services.find((service) => service.ssrCode === "MPWC")?.chargeComment).toContain(
			"Collapsible"
		);
	});

	it("creates dry and wet battery wheelchair services", () => {
		const dryBatteryPassenger = makePassenger({
			id: "dry-battery",
			nonChargeable: makeNonChargeable({
				assistanceService: makeAssistanceService({
					requestingAssistance: true,
					assistanceReasons: ["wheelchair"],
					canWalk: "no",
					needsOnboardWheelchair: "yes",
					bringingOwnWheelchair: "yes",
					wheelchairType: "electric",
					wheelchairBatteryType: "lithium-ion",
					wheelchairBatteryRemovable: "yes",
				}),
			}),
		});
		const wetBatteryPassenger = makePassenger({
			id: "wet-battery",
			nonChargeable: makeNonChargeable({
				assistanceService: makeAssistanceService({
					requestingAssistance: true,
					assistanceReasons: ["wheelchair"],
					canWalk: "no",
					bringingOwnWheelchair: "yes",
					wheelchairType: "electric",
					wheelchairBatteryType: "lead-acid",
					wheelchairBatteryRemovable: "no",
				}),
			}),
		});

		const services = flattenSelectedServices(
			prepareServices([dryBatteryPassenger, wetBatteryPassenger])
		);

		expect(services.some((service) => service.ssrCode === "DBWC")).toBe(true);
		expect(services.some((service) => service.ssrCode === "WBWC")).toBe(true);
		expect(services.find((service) => service.ssrCode === "DBWC")?.chargeComment).toContain(
			"Remove battery ok"
		);
		expect(services.find((service) => service.ssrCode === "WBWC")?.chargeComment).toContain(
			"Unable to remove battery"
		);
	});

	it("creates a service dog SSR with cage details", () => {
		const passenger = makePassenger({
			nonChargeable: makeNonChargeable({
				dogForm: makeDogForm({
					accompaniedByServiceDog: true,
					serviceDogBreed: "LAB",
					serviceDogWeight: "25",
					serviceDogCagePresence: "with-cage",
					serviceDogCageDepth: "40",
					serviceDogCageWidth: "30",
					serviceDogCageHeight: "20",
					serviceDogCageWeight: "10",
				}),
			}),
		});

		const svan = flattenSelectedServices(prepareServices([passenger])).find(
			(service) => service.ssrCode === "SVAN"
		);

		expect(svan?.chargeComment).toContain("Cage L-40 cm W-30 cm H-20 cm Weight-10 kg");
	});

	it("creates stop SSR only for eligible travel document combinations", () => {
		const militaryPassenger = makePassenger({
			id: "military",
			nonChargeable: makeNonChargeable({
				travelDocument: {
					hasTravelDocs: true,
					documentType: "military-id",
					documentNumber: "M123",
					documentExpiryDate: { year: "2030", month: "12", day: "31" },
					issuingCountry: "USA",
					purposeOfTravel: "other",
					evusObtained: false,
				},
			}),
		});
		const visaPassenger = makePassenger({
			id: "visa",
			nonChargeable: makeNonChargeable({
				travelDocument: {
					hasTravelDocs: true,
					documentType: "visa",
					documentNumber: "V123",
					documentExpiryDate: { year: "2030", month: "12", day: "31" },
					issuingCountry: "USA",
					purposeOfTravel: "exchange-visits",
					evusObtained: false,
				},
			}),
		});
		const ineligibleVisaPassenger = makePassenger({
			id: "no-stop",
			nonChargeable: makeNonChargeable({
				travelDocument: {
					hasTravelDocs: true,
					documentType: "visa",
					documentNumber: "V999",
					documentExpiryDate: { year: "2030", month: "12", day: "31" },
					issuingCountry: "USA",
					purposeOfTravel: "other",
					evusObtained: false,
				},
			}),
		});

		const services = flattenSelectedServices(
			prepareServices([militaryPassenger, visaPassenger, ineligibleVisaPassenger])
		);

		expect(services.filter((service) => service.ssrCode === "STOP")).toHaveLength(2);
		expect(
			services.some((service) => service.passengerId === "no-stop" && service.ssrCode === "STOP")
		).toBe(false);
		expect(services.find((service) => service.passengerId === "military")?.description).toBe(
			"CHECKIN DENY"
		);
	});

	it("skips pregnancy services when weeks are blank", () => {
		const passenger = makePassenger({
			id: "pregnancy-blank",
			nonChargeable: makeNonChargeable({
				isPregnant: true,
				pregnancyWeeks: "   ",
			}),
		});

		expect(flattenSelectedServices(prepareServices([passenger]))).toHaveLength(0);
	});

	it("sanitizes service dog values", () => {
		const passenger = makePassenger({
			nonChargeable: makeNonChargeable({
				dogForm: makeDogForm({
					accompaniedByServiceDog: true,
					serviceDogBreed: "LAB@#$",
					serviceDogWeight: "25%",
					serviceDogCagePresence: "without-cage",
				}),
			}),
		});

		const svan = flattenSelectedServices(prepareServices([passenger])).find(
			(service) => service.ssrCode === "SVAN"
		);

		expect(svan?.chargeComment).toContain("LAB");
		expect(svan?.chargeComment).not.toContain("@");
		expect(svan?.chargeComment).not.toContain("%");
	});

	it("uses passenger type code when available", () => {
		const passenger = makePassenger({
			passengerTypeCode: "adult",
			nonChargeable: makeNonChargeable({
				isPregnant: true,
				pregnancyWeeks: "10",
			}),
		});

		const services = flattenSelectedServices(prepareServices([passenger]));

		expect(services[0]?.passengerType).toBe("adult");
	});

	it("groups services for multiple passengers", () => {
		const firstPassenger = makePassenger({
			id: "pax-1",
			nonChargeable: makeNonChargeable({
				isPregnant: true,
				pregnancyWeeks: "12",
			}),
		});
		const secondPassenger = makePassenger({
			id: "pax-2",
			passengerTypeCode: "childA",
			nonChargeable: makeNonChargeable({
				isPregnant: true,
				pregnancyWeeks: "18",
			}),
		});

		const result = prepareServices([firstPassenger, secondPassenger]);

		expect(result.passengers).toHaveLength(2);
		expect(result.passengers.map((passenger) => passenger.id)).toEqual(["pax-1", "pax-2"]);
		expect(flattenSelectedServices(result)).toHaveLength(2);
	});
});
