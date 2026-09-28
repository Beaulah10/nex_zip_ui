/**
 * File: seat-status-utils.ts
 * Description: Maps seat service codes from the API to seat map statuses,
 * supporting cabin-specific seat statuses.
 */
import { SERVICE_CODE_TO_STATUS } from "@/modules/utils/constants/seat-map/seat-map.constants";
import type { SeatPositionType, SeatStatus } from "@/types/seat-map/seat-map.types";

/**
 * Returns the seat status for a given API service code.
 *
 * For ZIP Full Flat seats (STZF) the status is resolved from the seat type:
 *   - Middle → "central"
 *   - Window / Aisle → "central"
 * For all Standard-cabin service codes the mapping is direct.
 */
export function getSeatStatusFromServiceCode(
	serviceCode: string,
	_seatType: SeatPositionType
): SeatStatus {
	if (serviceCode === "STZF") {
		return "central";
	}

	return SERVICE_CODE_TO_STATUS[serviceCode] ?? "front-tier";
}
