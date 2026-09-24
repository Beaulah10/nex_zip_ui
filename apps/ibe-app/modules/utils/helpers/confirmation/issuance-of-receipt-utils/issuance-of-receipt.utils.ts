export const RECEIPT_MANUAL_VALUE = "manual";

export type ReceiptPassengerOption = {
	value: string;
	label: string;
	email: string;
};

type ReceiptPassengerOptionSource = {
	id: string;
	firstName?: string;
	middleName?: string;
	lastName?: string;
	contactInformation?: {
		email?: string;
	};
};

export function buildReceiptPassengerOptions(
	passengers: ReadonlyArray<ReceiptPassengerOptionSource>
): ReceiptPassengerOption[] {
	return passengers.map((passenger) => ({
		value: passenger.id,
		label: formatReceiptPassengerName(passenger),
		email: passenger.contactInformation?.email?.trim() ?? "",
	}));
}

function formatReceiptPassengerName(passenger: ReceiptPassengerOptionSource): string {
	const fullName = [passenger.firstName, passenger.middleName, passenger.lastName]
		.filter(Boolean)
		.join(" ")
		.toUpperCase();

	return fullName || passenger.id;
}
