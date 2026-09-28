/**
 * Formats a time string from HH:mm to HHHMM format.
 *
 * Example:
 * - "08:30" -> "08H30M"
 *
 * @param time Time in HH:mm format.
 * @returns Formatted time string.
 */

const formatFlightTime = (time: string): string => {
	if (!time) return "";

	const [hours, minutes] = time.split(":");
	return `${hours}H${minutes}M`;
};

export default formatFlightTime;

export const formatDuration = (time?: string): string => {
	if (!time?.includes(":")) {
		return "";
	}

	const [h, m] = time.split(":");

	const hours = Number(h);
	const minutes = Number(m);

	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return "";
	}

	return `${hours}h ${minutes}m`;
};
