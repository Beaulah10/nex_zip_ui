/**
 * File: expand-cabin-rows.ts
 * Description: Expands cabin row data into a seat map structure by converting fixed and template rows into rendered seat rows with calculated seat details and statuses.
 */

import { getSeatStatusFromServiceCode } from "@/modules/utils/helpers/seat-map/seat-status-utils/seat-status-utils";
import type {
	Cabin,
	ExpandedRow,
	ExpandedSeat,
	FixedCabinRow,
	RawSeat,
	TemplateCabinRow,
} from "@/types/seat-map/seat-map.types";

function isTemplateRow(row: Cabin["rows"][number]): row is TemplateCabinRow {
	return "rowRange" in row;
}

function buildSeat(rawSeat: RawSeat): ExpandedSeat {
	const column = rawSeat.seat.replace(/^\d+/, "");
	const status = !rawSeat.isSeatAvailable
		? "not-selectable"
		: getSeatStatusFromServiceCode(rawSeat.serviceCode, rawSeat.type);
	return {
		code: rawSeat.seat,
		column,
		type: rawSeat.type,
		status,
		isSeatAvailable: rawSeat.isSeatAvailable,
		amount: rawSeat.amount,
		serviceCode: rawSeat.serviceCode,
	};
}

function expandFixedRow(row: FixedCabinRow): ExpandedRow {
	return {
		row: row.row,
		layout: row.layout,
		seats: row.seats.map((seat) => buildSeat(seat)),
	};
}

/**
 * Handles TemplateCabinRow — used only by the mock reference data.
 * API responses always produce FixedCabinRow via buildSeatMapFromApiResponse.
 */
function expandTemplateRow(row: TemplateCabinRow): ExpandedRow[] {
	const [startText, endText] = row.rowRange.split("-");
	const start = Number(startText);
	const end = Number(endText);
	const rows: ExpandedRow[] = [];

	for (let rowNumber = start; rowNumber <= end; rowNumber++) {
		rows.push({
			row: rowNumber,
			layout: row.layout,
			seats: row.templateSeats.map((template) => {
				const syntheticSeat: RawSeat = {
					seat: `${rowNumber}${template.column}`,
					type: template.type,
					isSeatAvailable: true,
					amount: 0,
					serviceCode: "",
				};
				return buildSeat(syntheticSeat);
			}),
		});
	}

	return rows;
}

export function expandCabinRows(cabin: Cabin): ExpandedRow[] {
	return cabin.rows.flatMap((row) =>
		isTemplateRow(row) ? expandTemplateRow(row) : expandFixedRow(row)
	);
}
