import { isYvrRoute } from "@/modules/utils/helpers/common/route-type/route-type";
import type { FlightSelectionRequest } from "@/types/flight-selection/flight-selection.types";
import type {
	PassengerNameLabels,
	PassengerSection,
	PassengerSectionCode,
	PassengerSectionConfig,
	PassengerService,
	PassengerServiceGroups,
	PassengerValues,
} from "@/types/passenger/passenger.type";
import { createPassengerServiceGroups } from "@/types/passenger/passenger.type";

const PASSENGER_SECTION_CONFIG: Array<[PassengerSectionCode, PassengerSectionConfig]> = [
	[
		"adult",
		{
			countKey: "adult",
			mainLabelKey: "adult_passenger",
			ageLabelKey: "adult_age",
			hasAccompanyingAdult: false,
		},
	],
	[
		"childA",
		{
			countKey: "childA",
			mainLabelKey: "child_passenger",
			ageLabelKey: "older_child_age",
			hasAccompanyingAdult: false,
			requiresYvrRoute: true,
		},
	],
	[
		"childB",
		{
			countKey: "childB",
			mainLabelKey: "child_passenger",
			ageLabelKey: "child_age",
			hasAccompanyingAdult: false,
			requiresYvrRoute: true,
		},
	],
	[
		"childC",
		{
			countKey: "childC",
			mainLabelKey: "child_passenger",
			ageLabelKey: "younger_child_age",
			hasAccompanyingAdult: true,
		},
	],
	[
		"infant",
		{
			countKey: "infant",
			mainLabelKey: "infant_passenger",
			ageLabelKey: "infant_age",
			hasAccompanyingAdult: true,
		},
	],
];

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
	value && typeof value === "object" ? (value as Record<string, unknown>) : undefined;

function toPassengerServiceGroups(services: unknown): PassengerValues["services"] | undefined {
	if (!services) {
		return undefined;
	}

	if (Array.isArray(services)) {
		return createPassengerServiceGroups({
			"non-chargeable": services as PassengerService[],
		});
	}

	if (typeof services !== "object") {
		return undefined;
	}

	return createPassengerServiceGroups(services as PassengerServiceGroups);
}

export function toPassengerValues(
	payload: Record<string, unknown>,
	current?: PassengerValues
): PassengerValues {
	const source = { ...current, ...payload } as Record<string, unknown>;
	const contact = asRecord(source.contactInformation);
	const emergency = asRecord(source.emergencyContact);

	return {
		id: String(source.id ?? ""),
		passengerTypeCode: (source.passengerTypeCode as string) ?? "",
		associateWithPassengerId: source.associateWithPassengerId as string | undefined,
		firstName: (source.firstName as string) ?? "",
		middleName: source.middleName as string | undefined,
		lastName: (source.lastName as string) ?? "",
		dateOfBirth: source.dateOfBirth as PassengerValues["dateOfBirth"],
		gender: source.gender as string | undefined,
		redressNumber: source.redressNumber as string | undefined,
		knownTravelerNumber: source.knownTravelerNumber as string | undefined,
		nationality: source.nationality as string | undefined,
		isPrimaryPassenger:
			(source.isPrimaryPassenger as boolean | undefined) ??
			(source.isPrimary as boolean | undefined),
		height:
			(source.height as number | string | undefined) ??
			(source.bodyHeight as number | string | undefined),
		weight:
			(source.weight as number | string | undefined) ??
			(source.bodyWeight as number | string | undefined),
		contactInformation: contact
			? {
					countryCode:
						(contact.countryCode as string | undefined) ??
						(contact.phoneExtension as string | undefined),
					phoneNumber:
						(contact.phoneNumber as string | undefined) ??
						(contact.mobileNumber as string | undefined),
					email: contact.email as string | undefined,
				}
			: undefined,
		emergencyContact: emergency
			? {
					countryCode: emergency.countryCode as string | undefined,
					phoneNumber: emergency.phoneNumber as string | undefined,
				}
			: contact
				? {
						countryCode: contact.emergencyExtension as string | undefined,
						phoneNumber: contact.emergencyNumber as string | undefined,
					}
				: undefined,
		apisInfo: asRecord(source.apisInfo) as PassengerValues["apisInfo"] | undefined,
		seats: source.seats as PassengerValues["seats"],
		services: toPassengerServiceGroups(source.services),
		bundles: source.bundles as PassengerValues["bundles"],
	};
}

export function buildPassengerNames(
	data: FlightSelectionRequest,
	passengerTypeLabels: PassengerNameLabels
): PassengerSection[] {
	const { routes } = data;

	const hasYvrRoute = isYvrRoute(routes);

	const passengerSections: PassengerSection[] = [];
	let sequence = 1;

	for (const [code, config] of PASSENGER_SECTION_CONFIG) {
		const count = data[config.countKey] ?? 0;
		for (let i = 0; i < count; i++) {
			const hasAccompanyingAdult = config.requiresYvrRoute
				? hasYvrRoute
				: config.hasAccompanyingAdult;

			passengerSections.push({
				id: String(sequence),
				mainLabel: passengerTypeLabels(config.mainLabelKey),
				ageLabel: passengerTypeLabels(config.ageLabelKey),
				hasAccompanyingAdult,
				passengerTypeCode: code,
			});

			sequence++;
		}
	}

	return passengerSections;
}
