/**
 * Resolves a readable label for a passenger type code.
 * Falls back to plain labels when no translation function is provided.
 */
export const getPassengerLabel = (passengerType: string, t: (key: string) => string): string => {
	switch (passengerType) {
		case "childA":
			return t("childA_label");

		case "childB":
			return t("childB_label");

		case "childC":
			return t("childC_label");

		case "infant":
			return t("infant_label");

		default:
			return passengerType;
	}
};

/**
 *
 * To display the passenger type in the below order for the PTC types.
 */
export const PASSENGER_DISPLAY_ORDER = ["childA", "childB", "childC", "infant"] as const;
