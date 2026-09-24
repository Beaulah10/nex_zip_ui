/**
 * File: build-seat-map-utils.ts
 * Description: Transforms seat map API response data into the cabin structure required by the SeatMap
 * component, including cabin rows, seat details, seat positions, availability, pricing, and
 * service information.
 */

import type { NEXUZR004OffersSeatInfo } from "@repo/sdk";
import { COLUMN_SEAT_TYPE } from "@/modules/utils/constants/seat-map/seat-map.constants";
import type {
	Cabin,
	FixedCabinRow,
	RawSeat,
	SeatPositionType,
} from "@/types/seat-map/seat-map.types";

function getSeatType(column: string): SeatPositionType {
	return COLUMN_SEAT_TYPE[column] ?? "Middle";
}

function getCabinName(cabinClass: Cabin["class"]): string {
	return cabinClass === "ZipFullFlat" ? "ZIP Full Flat" : "Standard";
}

/**
 * Transforms the API seat map response into a Cabin array consumed
 * by the SeatMap component.
 *
 * Each row from seatInfo becomes a FixedCabinRow. The seat type is derived
 * from the column letter; availability, amount and serviceCode are carried
 * directly from the API onto each RawSeat so that expand-cabin-rows can use
 * them when building ExpandedSeat objects.
 *
 * @param seatInfo   - Array of row entries from the API response data.seatInfo
 * @param cabinClass - The cabin being displayed ("ZipFullFlat" | "Standard")
 */
export function buildSeatMapFromApiResponse(
	seatInfo: NEXUZR004OffersSeatInfo[],
	cabinClass: Cabin["class"]
): Cabin[] {
	const rows: FixedCabinRow[] = seatInfo.map(({ row, seats }) => ({
		row,
		layout: cabinClass === "ZipFullFlat" ? "1-1" : "3-3-3",
		// The API includes placeholder entries with column: "" for aisle gaps — skip them.
		seats: seats
			.filter((apiSeat) => apiSeat.column !== "")
			.map(
				(apiSeat): RawSeat => ({
					seat: `${row}${apiSeat.column}`,
					type: getSeatType(apiSeat.column),
					isSeatAvailable: apiSeat.isSeatAvailable,
					amount: apiSeat.amount,
					serviceCode: apiSeat.serviceCode,
				})
			),
	}));

	return [
		{
			name: getCabinName(cabinClass),
			class: cabinClass,
			rows,
		},
	];
}
