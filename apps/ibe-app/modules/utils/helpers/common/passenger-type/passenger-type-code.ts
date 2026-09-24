/**
 * Normalizes passenger type codes from API and UI sources to shared internal keys.
 */
export function normalizePassengerType(passengerTypeCode?: string): string {
	if (!passengerTypeCode) {
		return "";
	}

	const normalized = passengerTypeCode.trim().toLowerCase();
	if (normalized === "adt") return "adult";
	if (normalized === "chd" || normalized === "chda") return "childa";
	if (normalized === "chdb") return "childb";
	if (normalized === "chdc") return "childc";
	if (normalized === "inf") return "infant";

	return normalized;
}

export function toApiPassengerType(passengerTypeCode?: string): string {
	switch (normalizePassengerType(passengerTypeCode)) {
		case "adult":
			return "Adult";
		case "childa":
			return "ChildA";
		case "childb":
			return "ChildB";
		case "childc":
			return "ChildC";
		case "infant":
			return "Infant";
		default:
			return passengerTypeCode?.trim() || "Adult";
	}
}
