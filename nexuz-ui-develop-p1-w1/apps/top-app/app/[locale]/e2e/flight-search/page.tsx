import FlightSearchPage from "@/components/flight-search/flight-search";

const routeGroups = [
	[{ origin: "NRT", destination: "SIN" }],
	[{ origin: "SIN", destination: "NRT" }],
	[{ origin: "BKK", destination: "SIN" }],
];

export default function E2eFlightSearchPage() {
	return <FlightSearchPage data={routeGroups} initialOrigin="NRT" />;
}
