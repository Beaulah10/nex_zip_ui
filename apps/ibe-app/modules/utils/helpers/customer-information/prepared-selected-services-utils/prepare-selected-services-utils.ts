/**
 * File: prepare-selected-services-utils.ts
 * Description: Helper functions for generating passenger SSR (Special Service Request) entries based on customer information selections.
 * It transforms assistance, pregnancy, wheelchair, and service dog details into selected service records used for passenger service processing and booking workflows.
 */

import { STOP_SSR_VISA_PURPOSE_VALUES } from "@/modules/utils/constants/customer-information/constants";
import type { SelectedSegment } from "@/store/slices/flight-selection/flight-selection.slice";
import type {
	AssistanceService,
	DogForm,
	Passenger,
} from "@/types/customer-information/customer-information.types";
import type {
	PassengerServices,
	SelectedService,
	SelectedServicesState,
} from "@/types/customer-information/selected-services.types";

export const NON_CHARGEABLE_SSR_CODES = new Set([
	"WCHR",
	"WCHS",
	"WCHC",
	"MPWC",
	"DBWC",
	"WBWC",
	"BLND",
	"DEAF",
	"PRGN",
	"SVAN",
	"STOP",
]);

// ── Battery classification ────────────────────────────────────────────────────

// Wet cell (spillable) battery types map to WBWC; all others map to DBWC.
const WET_BATTERY_TYPES = new Set(["lead-acid", "nickel-cadmium"]);

const isDryBattery = (batteryType: string): boolean => !WET_BATTERY_TYPES.has(batteryType);

// ── Sanitizer for SVAN comments ───────────────────────────────────────────────

// Only letters, numbers, dot, and dash are permitted in SVAN comment fields.
const sanitize = (text: string): string => text.replace(/[^a-zA-Z0-9.-]/g, "");

// ── Default entry factory ─────────────────────────────────────────────────────

function createService(
	ssrCode: string,
	chargeComment: string,
	passengerId: string,
	passengerTypeCode: string | undefined,
	segment: SelectedSegment
): SelectedService {
	return {
		lfid: segment.lfid,
		amount: 0,
		categoryId: 0,
		cutOffHours: 0,
		description: "",
		maxCountServiceLevel: 0,
		passengerType: passengerTypeCode ?? "",
		qtyAvailable: 0,
		ssrCode,
		serviceID: 0,
		passengerId,
		pfid: segment.pfid,
		chargeComment,
		bundleCode: "",
	};
}

// ── Comment builders ──────────────────────────────────────────────────────────

function buildWheelchairComment(a: AssistanceService | undefined): string {
	const parts: string[] = [];
	if (a?.canManagePersonalNeeds === "yes") {
		parts.push("Able to manage personal needs");
	} else if (a?.canManagePersonalNeeds === "no") {
		parts.push("Unable to manage personal needs");
	}

	if (a?.boardingWithAccompanion === "yes") {
		const name = a?.accompanyingPersonName?.trim() ?? "";
		parts.push(`With escort ${name}`.trimEnd());
	} else if (a?.boardingWithAccompanion === "no") {
		parts.push("Without escort");
	}

	if (a?.canWalk === "yes") {
		parts.push("Can walk");
	} else if (a?.canWalk === "no") {
		parts.push("Cannot walk at all");
	}

	if (a?.canWalk === "yes" && a?.canGoUpDownStairs === "yes") {
		parts.push("Can climb up-down stairs");
	} else if (a?.canWalk === "yes" && a?.canGoUpDownStairs === "no") {
		parts.push("Cannot climb up-down stairs");
	}

	if (a?.canWalk === "no" && a?.needsOnboardWheelchair === "yes") {
		parts.push("Use on-board wheelchair in CBN");
	}

	if (a?.reasonForWheelchair) {
		parts.push(a.reasonForWheelchair);
	}

	if (a?.bringingOwnWheelchair === "yes") {
		parts.push("Bring own wheelchair");
	} else if (a?.bringingOwnWheelchair === "no") {
		parts.push("Not bringing own wheelchair");
	}

	return parts.length > 0 ? `${parts.join(".")}.` : "";
}

function buildManualWheelChairComments(a: AssistanceService | undefined): string {
	const parts: string[] = [];
	const height = sanitize(a?.wheelchairHeight ?? "");
	const width = sanitize(a?.wheelchairWidth ?? "");
	const depth = sanitize(a?.wheelchairDepth ?? "");
	const weight = sanitize(a?.wheelchairWeight ?? "");
	parts.push(`Size ${height}x${width}x${depth}`);
	parts.push(`Weight ${weight} kg`);
	if (a?.isFoldable === "yes") {
		parts.push("Collapsible");
	} else if (a?.isFoldable === "no") {
		parts.push("Not collapsible");
	}
	return parts.length > 0 ? `${parts.join(". ")}.` : "";
}
function buildBatteryComment(a: AssistanceService | undefined): string {
	const parts: string[] = [];
	const height = sanitize(a?.wheelchairHeight ?? "");
	const width = sanitize(a?.wheelchairWidth ?? "");
	const depth = sanitize(a?.wheelchairDepth ?? "");
	const weight = sanitize(a?.wheelchairWeight ?? "");
	parts.push(`Size ${height}x${width}x${depth}`);
	parts.push(`Weight ${weight} kg`);
	if (a?.wheelchairBatteryRemovable === "yes") {
		parts.push("Remove battery ok");
	} else if (a?.wheelchairBatteryRemovable === "no") {
		parts.push("Unable to remove battery");
	}
	return parts.length > 0 ? `${parts.join(".")}.` : "";
}

function buildPersonalNeedsComment(a: AssistanceService | undefined): string {
	const parts: string[] = [];

	if (a?.canManagePersonalNeeds === "yes") {
		parts.push("Able to manage personal needs");
	} else if (a?.canManagePersonalNeeds === "no") {
		parts.push("Unable to manage personal needs");
	}

	if (a?.boardingWithAccompanion === "yes") {
		const name = a?.accompanyingPersonName?.trim() ?? "";
		parts.push(`With escort ${name}`.trimEnd());
	} else if (a?.boardingWithAccompanion === "no") {
		parts.push("Without escort");
	}

	return parts.length > 0 ? `${parts.join(".")}.` : "";
}

function buildSvanComment(d: DogForm | undefined): string {
	const weight = sanitize(d?.serviceDogWeight ?? "");
	const breed = sanitize(d?.serviceDogBreed ?? "");
	if (d?.serviceDogCagePresence === "with-cage") {
		const depth = sanitize(d?.serviceDogCageDepth ?? "");
		const width = sanitize(d?.serviceDogCageWidth ?? "");
		const height = sanitize(d?.serviceDogCageHeight ?? "");
		const cageWeight = sanitize(d?.serviceDogCageWeight ?? "");
		return `SSR SVAN.Service Dog.${weight} Kg.${breed}.Cage L-${depth} cm W-${width} cm H-${height} cm Weight-${cageWeight} kg.`;
	}

	return `SSR SVAN.Service Dog.${weight} Kg.${breed}.No Cage.`;
}

// ── Main utility ──────────────────────────────────────────────────────────────

const groupSelectedServicesByPassenger = (services: SelectedService[]): PassengerServices[] => {
	const byPassenger = new Map<string, SelectedService[]>();

	for (const service of services) {
		if (!service.passengerId) continue;

		const passengerServices = byPassenger.get(service.passengerId);
		if (passengerServices) {
			passengerServices.push(service);
			continue;
		}

		byPassenger.set(service.passengerId, [service]);
	}

	return Array.from(byPassenger.entries()).map(([id, passengerServices]) => ({
		id,
		services: passengerServices,
	}));
};

/**
 * Iterates over all passengers and produces nonchargeable SSR entries
 * (WCHR/WCHS/WCHC, MPWC/DBWC/WBWC, BLND, DEAF, PRGN, SVAN).
 *
 * Only `code`, `comments`, and `passengerId` are populated from passenger data;
 * all remaining fields retain their default values.
 *
 * CTCC-restricted reasons (illness, medical-devices, intellectual) produce no
 * SSR entries and are silently skipped.
 */
export function prepareSelectedServices(
	passengers: Passenger[],
	flightSegments: SelectedSegment[]
): SelectedServicesState {
	const services = passengers.flatMap((passenger) =>
		prepareSelectedServicesForPassenger(passenger, flightSegments)
	);

	return {
		passengers: groupSelectedServicesByPassenger(services),
	};
}

export function prepareSelectedServicesForPassenger(
	passenger: Passenger,
	flightSegments: SelectedSegment[]
): SelectedService[] {
	const { id, passengerTypeCode, nonChargeable } = passenger;
	if (!nonChargeable) return [];

	const services: SelectedService[] = [];
	const createPassengerService = (ssrCode: string, chargeComment: string): SelectedService[] =>
		flightSegments.map((segment) =>
			createService(ssrCode, chargeComment, id, passengerTypeCode, segment)
		);

	const { assistanceService, dogForm, isPregnant, pregnancyWeeks } = nonChargeable;

	const reasons = assistanceService?.assistanceReasons ?? [];
	const requestingAssistance = assistanceService?.requestingAssistance === true;

	// ── A. Wheelchair SSR (mobility assistance) ───────────────────────────────
	if (requestingAssistance && reasons.includes("wheelchair")) {
		const canWalk = assistanceService?.canWalk;
		const canGoUpDownStairs = assistanceService?.canGoUpDownStairs;

		let wheelchairCode: string | null = null;

		if (canWalk === "no") {
			wheelchairCode = "WCHC";
		} else if (canWalk === "yes" && canGoUpDownStairs === "yes") {
			wheelchairCode = "WCHR";
		} else if (canWalk === "yes" && canGoUpDownStairs === "no") {
			wheelchairCode = "WCHS";
		}

		if (wheelchairCode) {
			services.push(
				...createPassengerService(wheelchairCode, buildWheelchairComment(assistanceService))
			);
		}

		// Own wheelchair on board (MPWC / DBWC / WBWC)
		if (assistanceService?.bringingOwnWheelchair === "yes") {
			const wheelchairType = assistanceService?.wheelchairType;
			const batteryType = assistanceService?.wheelchairBatteryType ?? "";

			if (wheelchairType === "manual") {
				services.push(
					...createPassengerService("MPWC", buildManualWheelChairComments(assistanceService))
				);
			} else if (wheelchairType === "electric" && batteryType) {
				const ownCode = isDryBattery(batteryType) ? "DBWC" : "WBWC";

				services.push(...createPassengerService(ownCode, buildBatteryComment(assistanceService)));
			}
		}
	}

	// ── B. Visual / Hearing SSR ───────────────────────────────────────────────
	if (requestingAssistance && reasons.includes("visual")) {
		services.push(...createPassengerService("BLND", buildPersonalNeedsComment(assistanceService)));
	}

	if (requestingAssistance && reasons.includes("hearing")) {
		services.push(...createPassengerService("DEAF", buildPersonalNeedsComment(assistanceService)));
	}

	// ── C. Pregnancy SSR ──────────────────────────────────────────────────────
	if (isPregnant === true && pregnancyWeeks?.trim()) {
		services.push(...createPassengerService("PRGN", `${pregnancyWeeks} weeks.`));
	}

	// ── D. Service dog SSR ────────────────────────────────────────────────────
	if (
		dogForm?.accompaniedByServiceDog === true &&
		dogForm?.serviceDogBreed?.trim() &&
		dogForm?.serviceDogWeight?.trim()
	) {
		services.push(...createPassengerService("SVAN", buildSvanComment(dogForm)));
	}

	// ── E. STOP SSR (US Military Card or J/K/F visa type) ────────────────────
	const travelDoc = nonChargeable.travelDocument;
	if (
		travelDoc?.hasTravelDocs &&
		(travelDoc.documentType === "military-id" ||
			(travelDoc.documentType === "visa" &&
				STOP_SSR_VISA_PURPOSE_VALUES.includes(
					(travelDoc.purposeOfTravel ?? "") as (typeof STOP_SSR_VISA_PURPOSE_VALUES)[number]
				)))
	) {
		const stopServices = createPassengerService("STOP", "").map((service) => ({
			...service,
			description: "CHECKIN DENY",
		}));

		services.push(...stopServices);
	}

	return services;
}
