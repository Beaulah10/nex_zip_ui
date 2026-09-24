import { NextResponse } from "next/server";

const ROUTE_INFO = {
	data: {
		routeInfo: [
			[
				{
					origin: "NRT",
					destination: "ICN",
				},
			],
			[
				{
					origin: "NRT",
					destination: "TPE",
				},
			],
			[
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "NRT",
					destination: "HNL",
				},
			],
			[
				{
					origin: "NRT",
					destination: "YVR",
				},
			],
			[
				{
					origin: "NRT",
					destination: "SFO",
				},
			],
			[
				{
					origin: "NRT",
					destination: "SJC",
				},
			],
			[
				{
					origin: "NRT",
					destination: "LAX",
				},
			],
			[
				{
					origin: "NRT",
					destination: "IAH",
				},
			],
			[
				{
					origin: "NRT",
					destination: "MCO",
				},
			],
			[
				{
					origin: "ICN",
					destination: "NRT",
				},
			],
			[
				{
					origin: "ICN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "ICN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "ICN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "HNL",
				},
			],
			[
				{
					origin: "ICN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SFO",
				},
			],
			[
				{
					origin: "TPE",
					destination: "NRT",
				},
			],
			[
				{
					origin: "TPE",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "TPE",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "TPE",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "HNL",
				},
			],
			[
				{
					origin: "TPE",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SFO",
				},
			],
			[
				{
					origin: "TPE",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SJC",
				},
			],
			[
				{
					origin: "TPE",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "LAX",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "ICN",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "TPE",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "HNL",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "YVR",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SFO",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SJC",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "LAX",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "IAH",
				},
			],
			[
				{
					origin: "BKK",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "MCO",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "TPE",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "HNL",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "YVR",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SFO",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SJC",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "LAX",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "IAH",
				},
			],
			[
				{
					origin: "SIN",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "MCO",
				},
			],
			[
				{
					origin: "HNL",
					destination: "NRT",
				},
			],
			[
				{
					origin: "HNL",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "TPE",
				},
			],
			[
				{
					origin: "HNL",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "HNL",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "HNL",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "YVR",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "HNL",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SFO",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SJC",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "LAX",
				},
			],
			[
				{
					origin: "YVR",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "MCO",
				},
			],
			[
				{
					origin: "SFO",
					destination: "NRT",
				},
			],
			[
				{
					origin: "SJC",
					destination: "NRT",
				},
			],
			[
				{
					origin: "SJC",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "TPE",
				},
			],
			[
				{
					origin: "SJC",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "SJC",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "SJC",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "YVR",
				},
			],
			[
				{
					origin: "LAX",
					destination: "NRT",
				},
			],
			[
				{
					origin: "LAX",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "TPE",
				},
			],
			[
				{
					origin: "LAX",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "LAX",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "LAX",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "YVR",
				},
			],
			[
				{
					origin: "IAH",
					destination: "NRT",
				},
			],
			[
				{
					origin: "IAH",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "BKK",
				},
			],
			[
				{
					origin: "IAH",
					destination: "NRT",
				},
				{
					origin: "NRT",
					destination: "SIN",
				},
			],
			[
				{
					origin: "MCO",
					destination: "NRT",
				},
			],
		],
	},
};

export async function GET() {
	return NextResponse.json(ROUTE_INFO);
}
