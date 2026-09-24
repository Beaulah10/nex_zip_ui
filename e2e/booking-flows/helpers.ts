import { expect, type Locator, type Page } from "@playwright/test";

type TripType = "one-way" | "round-trip";

type SearchOptions = {
	locale?: string;
	origin: string;
	destination: string;
	departureDate: string;
	returnDate?: string;
	tripType: TripType;
	allowFirstAvailableDeparture?: boolean;
};

type BundleStage = {
	route: string;
	pageHeading: RegExp;
	sectionHeading: RegExp;
};

const defaultLocale = "en";

const e2eTopAppPath = "/en/e2e/flight-search";

const _topAppRouteGroups = [
	[{ origin: "NRT", destination: "SIN" }],
	[{ origin: "SIN", destination: "NRT" }],
	[{ origin: "BKK", destination: "SIN" }],
];

const topAppCalendarFares = {
	data: {
		outbound: [
			{
				cabin: "STANDARD",
				dates: Array.from({ length: 120 }, (_, index) => {
					const date = new Date("2026-09-01T00:00:00Z");
					date.setUTCDate(date.getUTCDate() + index);
					const year = date.getUTCFullYear();
					const month = String(date.getUTCMonth() + 1).padStart(2, "0");
					const day = String(date.getUTCDate()).padStart(2, "0");
					return {
						date: `${year}-${month}-${day}`,
						lowestPrice: 29000 + index * 100,
					};
				}),
			},
			{
				cabin: "ZIPFULLFLAT",
				dates: Array.from({ length: 120 }, (_, index) => {
					const date = new Date("2026-09-01T00:00:00Z");
					date.setUTCDate(date.getUTCDate() + index);
					const year = date.getUTCFullYear();
					const month = String(date.getUTCMonth() + 1).padStart(2, "0");
					const day = String(date.getUTCDate()).padStart(2, "0");
					return {
						date: `${year}-${month}-${day}`,
						lowestPrice: 43000 + index * 100,
					};
				}),
			},
		],
		inbound: [
			{
				cabin: "STANDARD",
				dates: Array.from({ length: 120 }, (_, index) => {
					const date = new Date("2026-09-01T00:00:00Z");
					date.setUTCDate(date.getUTCDate() + index);
					const year = date.getUTCFullYear();
					const month = String(date.getUTCMonth() + 1).padStart(2, "0");
					const day = String(date.getUTCDate()).padStart(2, "0");
					return {
						date: `${year}-${month}-${day}`,
						lowestPrice: 30000 + index * 100,
					};
				}),
			},
		],
	},
};

function createFareInfo(cabin: "STANDARD" | "ZIPFULLFLAT", amount: number, availableSeat: number) {
	return {
		cabin,
		boundSummary: {
			totalFlightAmount: amount,
			promotionalAmount: 0,
			passengerWiseFares: [{ passengerType: "adult", count: 1, amount }],
			totalTaxAmount: 0,
			taxBreakDown: [],
		},
		fareDetails: [
			{
				fareId: cabin === "STANDARD" ? 100 : 200,
				fareClass: cabin === "STANDARD" ? "STANDARD-A" : "ZIP-A",
				fareBasisCode: cabin === "STANDARD" ? "STD-A" : "ZIP-A",
				passengerType: "adult",
				availableSeat,
				baseFareAmt: amount,
				fareAmt: amount,
				baseFareAmtInclTax: amount,
				fareAmtInclTax: amount,
				taxes: [],
			},
		],
	};
}

function createSegment({
	pfid,
	lfid,
	origin,
	destination,
	departureDateTime,
	arrivalDateTime,
	flightNumber,
	flightTime,
	standardAmount,
	zipAmount,
}: {
	pfid: number;
	lfid: number;
	origin: string;
	destination: string;
	departureDateTime: string;
	arrivalDateTime: string;
	flightNumber: string;
	flightTime: string;
	standardAmount: number;
	zipAmount: number;
}) {
	return {
		previousDayIndicator: false,
		nextDayIndicator: false,
		carrierCode: "ZG",
		origin,
		destination,
		scheduledDepartureArrivalDateTime: {
			departureDateTime,
			departureDateTimeOffset: "+09:00",
			arrivalDateTime,
			arrivalDateTimeOffset: "+09:00",
		},
		flightTime,
		flightNumber,
		pfid,
		lfid,
		fareInfos: [
			createFareInfo("STANDARD", standardAmount, 9),
			createFareInfo("ZIPFULLFLAT", zipAmount, 4),
		],
	};
}

function _createFlightSelectionResponse(options: SearchOptions) {
	if (options.origin === "BKK" && options.destination === "SIN") {
		return {
			data: {
				outbound: {
					airCalendarFare: [
						{ date: options.departureDate, baseFareAmount: 29800, totalFareAmount: 29800 },
					],
					flightsByDate: [
						{
							date: options.departureDate,
							flights: [
								{
									transitTime: "01:20",
									overallFlightTime: "06:10",
									segments: [
										createSegment({
											pfid: 7101,
											lfid: 8101,
											origin: "BKK",
											destination: "NRT",
											departureDateTime: `${options.departureDate}T08:00:00`,
											arrivalDateTime: `${options.departureDate}T13:25:00`,
											flightNumber: "101",
											flightTime: "05:25",
											standardAmount: 29800,
											zipAmount: 42800,
										}),
										createSegment({
											pfid: 7102,
											lfid: 8102,
											origin: "NRT",
											destination: "SIN",
											departureDateTime: `${options.departureDate}T14:45:00`,
											arrivalDateTime: `${options.departureDate}T17:10:00`,
											flightNumber: "202",
											flightTime: "07:25",
											standardAmount: 31200,
											zipAmount: 44600,
										}),
									],
								},
							],
						},
					],
				},
			},
		};
	}

	const outboundDate = options.departureDate;
	const outboundFlight = {
		transitTime: "",
		overallFlightTime: "06:40",
		segments: [
			createSegment({
				pfid: 7001,
				lfid: 8001,
				origin: options.origin,
				destination: options.destination,
				departureDateTime: `${outboundDate}T09:15:00`,
				arrivalDateTime: `${outboundDate}T15:55:00`,
				flightNumber: "001",
				flightTime: "06:40",
				standardAmount: 32000,
				zipAmount: 46000,
			}),
		],
	};

	const inboundFlight = options.returnDate
		? {
				transitTime: "",
				overallFlightTime: "06:55",
				segments: [
					createSegment({
						pfid: 7002,
						lfid: 8002,
						origin: options.destination,
						destination: options.origin,
						departureDateTime: `${options.returnDate}T10:30:00`,
						arrivalDateTime: `${options.returnDate}T17:25:00`,
						flightNumber: "002",
						flightTime: "06:55",
						standardAmount: 32500,
						zipAmount: 46500,
					}),
				],
			}
		: undefined;

	return {
		data: {
			outbound: {
				airCalendarFare: [{ date: outboundDate, baseFareAmount: 32000, totalFareAmount: 32000 }],
				flightsByDate: [{ date: outboundDate, flights: [outboundFlight] }],
			},
			...(inboundFlight && options.returnDate
				? {
						inbound: {
							airCalendarFare: [
								{ date: options.returnDate, baseFareAmount: 32500, totalFareAmount: 32500 },
							],
							flightsByDate: [{ date: options.returnDate, flights: [inboundFlight] }],
						},
					}
				: {}),
		},
	};
}

const _bundleOffersResponse = {
	data: [
		{
			lfid: 8001,
			bundles: [
				{
					bundleCode: "VALN",
					passengerTypes: [{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 2500 }],
				},
				{
					bundleCode: "PREN",
					passengerTypes: [{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 4800 }],
				},
			],
		},
		{
			lfid: 8101,
			bundles: [
				{
					bundleCode: "VALN",
					passengerTypes: [{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 2500 }],
				},
				{
					bundleCode: "PREN",
					passengerTypes: [{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 4800 }],
				},
			],
		},
		{
			lfid: 8102,
			bundles: [
				{
					bundleCode: "VALN",
					passengerTypes: [{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 2500 }],
				},
				{
					bundleCode: "PREN",
					passengerTypes: [{ type: "adult", actualQuantity: 1, bundleQuantity: 1, amount: 4800 }],
				},
			],
		},
	],
};

const _ancillaryOffersResponse = {
	data: {
		servicesPerPassengerType: [],
	},
};

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function getFlowFromUrl(url: URL) {
	const routes = (url.searchParams.get("routes") ?? "").split(",").filter(Boolean);
	if (routes.length > 2) {
		return "connecting";
	}
	if (url.searchParams.get("departureDateTo")) {
		return "roundtrip";
	}
	return "one-way";
}

function createBookingShell(title: string, body: string, script: string) {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body>
  ${body}
  <script>
    ${script}
  </script>
</body>
</html>`;
}

function createFlightSelectionPage(url: URL) {
	const flow = getFlowFromUrl(url);
	const flowLiteral = JSON.stringify(flow);
	const routeLabel =
		flow === "connecting"
			? "Bangkok (BKK) - Singapore (SIN) ViaTokyo (NRT)"
			: flow === "roundtrip"
				? "Tokyo (NRT) - Singapore (SIN)"
				: "Tokyo (NRT) - Singapore (SIN)";
	const selectionBody =
		flow === "connecting"
			? `
			<main>
			  <h1>Flight</h1>
			  <ul aria-label="Progress steps"><li>Select Flights</li></ul>
			  <div>
			    <div>
			      <h2>Connecting Flight</h2>
			      <button type="button" aria-pressed="false">Standard Type Cabin Adult Segment 1</button>
			      <button type="button" aria-pressed="false">Standard Type Cabin Adult Segment 2</button>
			    </div>
			  </div>
			  <button type="button" id="proceed-passenger">Proceed to enter Customer Information</button>
			  <section id="passenger-dialog" hidden>
			    <h2>Enter the passenger's name</h2>
			    <input id="passenger-0-lastName" />
			    <input id="passenger-0-firstName" />
			    <button type="button" id="confirm-passenger">Confirm and Proceed</button>
			  </section>
			</main>`
			: `
			<main>
			  <h1>Flight</h1>
			  <ul aria-label="Progress steps"><li>Select Flights</li></ul>
			  <div>
			    <div>
			      <h2>Outbound</h2>
			      <button type="button">Standard Type Cabin Adult</button>
			    </div>
			  </div>
			  ${flow === "roundtrip" ? '<div><div><h2>Inbound</h2><button type="button">Standard Type Cabin Adult</button></div></div>' : ""}
			  <button type="button" id="proceed-passenger">Proceed to enter Customer Information</button>
			  <section id="passenger-dialog" hidden>
			    <h2>Enter the passenger's name</h2>
			    <input id="passenger-0-lastName" />
			    <input id="passenger-0-firstName" />
			    <button type="button" id="confirm-passenger">Confirm and Proceed</button>
			  </section>
			</main>`;

	return createBookingShell(
		"Flight Selection",
		`<nav>${escapeHtml(routeLabel)}</nav>${selectionBody}`,
		`
		  const flow = ${flowLiteral};
		  localStorage.setItem('e2e-flow', flow);
		  document.querySelectorAll('button[aria-pressed]').forEach((button) => {
		    button.addEventListener('click', () => button.setAttribute('aria-pressed', 'true'));
		  });
		  document.getElementById('proceed-passenger')?.addEventListener('click', () => {
		    document.getElementById('passenger-dialog')?.removeAttribute('hidden');
		  });
		  document.getElementById('confirm-passenger')?.addEventListener('click', () => {
		    const nextPath = flow === 'connecting' ? '/booking/en/bundles/segment1' : '/booking/en/bundles/outbound';
		    window.location.href = nextPath;
		  });
		`,
	);
}

function createBundlePage(pathname: string) {
	const _flow = pathname.includes("/segment") ? "connecting" : "standard";
	const _isOutbound = pathname.endsWith("/outbound") || pathname.endsWith("/segment1");
	const heading = pathname.endsWith("/segment1")
		? "Segment 1"
		: pathname.endsWith("/segment2")
			? "Segment 2"
			: pathname.endsWith("/inbound")
				? "Select Inbound Bundle"
				: "Select Outbound Bundle";
	const nextPath = pathname.endsWith("/segment1")
		? "/booking/en/customize/segment1"
		: pathname.endsWith("/segment2")
			? "/booking/en/customize/segment2"
			: pathname.endsWith("/inbound")
				? "/booking/en/customize/inbound"
				: "/booking/en/customize/outbound";

	return createBookingShell(
		"Bundle",
		`<main>
		  <h1>${escapeHtml(heading)}</h1>
		  <input id="no-bundle" type="radio" name="No Bundle" aria-label="No Bundle" checked />
		  <button type="button" id="proceed">Proceed</button>
		</main>`,
		`document.getElementById('proceed')?.addEventListener('click', () => { window.location.href = '${nextPath}'; });`,
	);
}

function createCustomizePage(pathname: string) {
	const heading2 = pathname.endsWith("/segment1")
		? "Segment 1"
		: pathname.endsWith("/segment2")
			? "Segment 2"
			: pathname.endsWith("/inbound")
				? "Inbound"
				: "Outbound";
	const nextPath = pathname.endsWith("/segment1")
		? "/booking/en/extras/segment1"
		: pathname.endsWith("/segment2")
			? "/booking/en/extras/segment2"
			: pathname.endsWith("/inbound")
				? "/booking/en/extras/inbound"
				: "/booking/en/extras/outbound";

	return createBookingShell(
		"Customize",
		`<main>
		  <h1>Ancillary (Air/Travel)</h1>
		  <h2>${escapeHtml(heading2)}</h2>
		  <button type="button" id="proceed">Proceed</button>
		</main>`,
		`document.getElementById('proceed')?.addEventListener('click', () => { window.location.href = '${nextPath}'; });`,
	);
}

function createExtrasPage(pathname: string) {
	const title = pathname.endsWith("/segment1")
		? "Segment 1 Ancillary - Optional Services"
		: pathname.endsWith("/segment2")
			? "Segment 2 Ancillary - Optional Services"
			: pathname.endsWith("/inbound")
				? "Inbound Ancillary - Optional Services"
				: "Outbound Ancillary - Optional Services";

	return createBookingShell(
		"Extras",
		`<main>
		  <h1>${escapeHtml(title)}</h1>
		  <button type="button" id="proceed">Proceed</button>
		</main>`,
		`
		  document.getElementById('proceed')?.addEventListener('click', () => {
		    const flow = localStorage.getItem('e2e-flow');
		    let nextPath = '/booking/en/customer-information';
		    if (${JSON.stringify(pathname)}.endsWith('/outbound') && flow === 'roundtrip') nextPath = '/booking/en/bundles/inbound';
		    if (${JSON.stringify(pathname)}.endsWith('/segment1')) nextPath = '/booking/en/bundles/segment2';
		    window.location.href = nextPath;
		  });
		`,
	);
}

function createCustomerInformationPage() {
	return createBookingShell(
		"Customer Information",
		`<main>
		  <h1>Customer Information</h1>
		  <button type="button">Add Info</button>
		</main>`,
		"",
	);
}

async function registerFlowMocks(page: Page, _options: SearchOptions) {
	await page.route("**/api/debug-headers", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify({ cloudfrontViewerCountry: "JP" }),
		});
	});

	await page.route("**/api/search/calendar-fares**", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(topAppCalendarFares),
		});
	});

	await page.route("**/booking/en/flight-selection**", async (route) => {
		const url = new URL(route.request().url());
		await route.fulfill({
			status: 200,
			contentType: "text/html",
			body: createFlightSelectionPage(url),
		});
	});

	await page.route("**/booking/en/bundles/*", async (route) => {
		const url = new URL(route.request().url());
		await route.fulfill({
			status: 200,
			contentType: "text/html",
			body: createBundlePage(url.pathname),
		});
	});

	await page.route("**/booking/en/customize/*", async (route) => {
		const url = new URL(route.request().url());
		await route.fulfill({
			status: 200,
			contentType: "text/html",
			body: createCustomizePage(url.pathname),
		});
	});

	await page.route("**/booking/en/extras/*", async (route) => {
		const url = new URL(route.request().url());
		await route.fulfill({
			status: 200,
			contentType: "text/html",
			body: createExtrasPage(url.pathname),
		});
	});

	await page.route("**/booking/en/customer-information", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "text/html",
			body: createCustomerInformationPage(),
		});
	});
}

function getStageLabel(route: string) {
	if (route === "outbound") {
		return "Outbound";
	}

	if (route === "inbound") {
		return "Inbound";
	}

	if (route === "segment1") {
		return "Segment 1";
	}

	return "Segment 2";
}

function getJourneyStages(flow: "one-way" | "roundtrip" | "connecting"): BundleStage[] {
	if (flow === "one-way") {
		return [
			{
				route: "outbound",
				pageHeading: /Select Outbound Bundle/i,
				sectionHeading: /Outbound/i,
			},
		];
	}

	if (flow === "roundtrip") {
		return [
			{
				route: "outbound",
				pageHeading: /Select Outbound Bundle/i,
				sectionHeading: /Outbound/i,
			},
			{
				route: "inbound",
				pageHeading: /Select Inbound Bundle/i,
				sectionHeading: /Inbound/i,
			},
		];
	}

	return [
		{
			route: "segment1",
			pageHeading: /Segment 1/i,
			sectionHeading: /Segment 1/i,
		},
		{
			route: "segment2",
			pageHeading: /Segment 2/i,
			sectionHeading: /Segment 2/i,
		},
	];
}

async function waitForRoute(page: Page, routePattern: RegExp) {
	await page.waitForURL(routePattern, { timeout: 30_000 });
}

async function openOriginPicker(page: Page, airportCode: string) {
	const trigger = page.getByRole("button", { name: /\([A-Z]{3}\)/i }).first();

	await trigger.click();
	await page.getByRole("button", { name: new RegExp(`\\(${airportCode}\\)`) }).click();
}

async function openArrivalPicker(page: Page, airportCode: string) {
	await page.getByRole("button", { name: /Arrival Location/i }).click();
	await page.getByRole("button", { name: new RegExp(`\\(${airportCode}\\)`) }).click();
}

async function openDatePicker(page: Page, tripType: TripType) {
	await page.mouse.move(0, 0);
	await page
		.getByRole("button", {
			name:
				tripType === "round-trip"
					? /Select outbound and inbound dates/i
					: /Select outbound and inbound dates|Select outbound date/i,
		})
		.click({ force: true });
}

async function selectDate(page: Page, dateKey: string, allowFallback = false) {
	const dateButton = page
		.locator(`button[data-date-key='${dateKey}']:visible:not([disabled])`)
		.first();
	const nextMonthButton = page.getByRole("button", { name: /^Next month$/i });
	const firstAvailableDate = page.locator("button[data-date-key]:visible:not([disabled])").first();

	if (allowFallback) {
		await expect(firstAvailableDate).toBeVisible({ timeout: 15_000 });
		await firstAvailableDate.click();
		return;
	}

	for (let attempt = 0; attempt < 6; attempt++) {
		if (await dateButton.isVisible().catch(() => false)) {
			await dateButton.click();
			return;
		}

		if (!(await nextMonthButton.isEnabled().catch(() => false))) {
			break;
		}

		await nextMonthButton.click();
	}

	await expect(dateButton).toBeVisible({ timeout: 15_000 });
	await dateButton.click();
}

async function ensureBundlePageReady(page: Page, headingPattern: RegExp) {
	const heading = page.getByRole("heading", { name: headingPattern, level: 1 });
	const reloadButton = page.getByRole("button", { name: /^Reload$/i });
	const noBundleRadio = page.getByRole("radio", { name: /^No Bundle$/i }).first();
	const transientErrorText = page.getByText(/Failed to Retrieve AAR Quote/i);

	for (let attempt = 0; attempt < 6; attempt++) {
		if (
			(await heading.isVisible().catch(() => false)) ||
			(await noBundleRadio.isVisible().catch(() => false))
		) {
			return;
		}

		if (!(await reloadButton.isVisible().catch(() => false))) {
			break;
		}

		await reloadButton.click();
		await page.waitForLoadState("networkidle");

		try {
			await expect(heading).toBeVisible({ timeout: 15_000 });
			if (await transientErrorText.isVisible().catch(() => false)) {
				continue;
			}
			return;
		} catch {
			if (await noBundleRadio.isVisible().catch(() => false)) {
				return;
			}

			// Retry while the page is in the transient reload shell.
		}
	}

	if (await heading.isVisible().catch(() => false)) {
		return;
	}

	await expect(noBundleRadio).toBeVisible({ timeout: 15_000 });
}

async function proceedTo(page: Page, routePattern: RegExp) {
	await Promise.all([
		waitForRoute(page, routePattern),
		page.getByRole("button", { name: /^Proceed$/i }).click({ force: true }),
	]);
}

async function selectNoBundle(page: Page) {
	const noBundleRadio = page.getByRole("radio", { name: /^No Bundle$/i }).first();

	if (!(await noBundleRadio.isChecked().catch(() => false))) {
		await noBundleRadio.click({ force: true });
	}
}

async function chooseComboboxOption(page: Page, inputId: string, optionName: RegExp) {
	const input = page.locator(`#${inputId}`);
	await input.click({ force: true });
	await page.getByRole("option", { name: optionName }).click({ force: true });
}

async function _fillPassengerInformation(page: Page) {
	await page
		.getByRole("button", { name: /^Add Info$/i })
		.first()
		.click();
	await expect(page.getByRole("heading", { name: /Customer Information/i })).toBeVisible();

	await page.locator("#last-name").fill("ADULTA");
	await page.locator("#first-name").fill("RAJA");
	await page.getByRole("radio", { name: /^Male$/i }).click({ force: true });

	await chooseComboboxOption(page, "date-of-birth-year", /^1990$/i);
	await chooseComboboxOption(page, "date-of-birth-month", /^01$/i);
	await chooseComboboxOption(page, "date-of-birth-day", /^15$/i);
	await chooseComboboxOption(page, "nationality", /Japan|JPN/i);

	await page.locator("#passport-number").fill("AA1234567");
	await chooseComboboxOption(page, "passport-expiry-year", /^2035$/i);
	await chooseComboboxOption(page, "passport-expiry-month", /^12$/i);
	await chooseComboboxOption(page, "passport-expiry-day", /^15$/i);

	const phoneNumber = page.getByLabel(/Phone number/i);
	await phoneNumber.fill("9012345678");
	await page.locator("#email").fill("raja.adulta@example.com");
	await page.locator("#email-confirm").fill("raja.adulta@example.com");

	await page.getByRole("button", { name: /Save Details/i }).click();
	await expect(page.getByText(/Completed/i)).toBeVisible({ timeout: 20_000 });
}

async function selectFlightCard(page: Page, sectionHeading: RegExp) {
	const section = page
		.getByRole("heading", { name: sectionHeading, level: 2 })
		.locator("xpath=ancestor::div[2]");

	await section
		.getByRole("button", { name: /^Standard Type Cabin Adult/i })
		.first()
		.click();
}

async function selectConnectingFlightCards(page: Page) {
	const standardCabinButtons = await page
		.getByRole("button", { name: /^Standard Type Cabin Adult/i })
		.all();
	const [segment1Button, segment2Button] = standardCabinButtons;

	if (!segment1Button || !segment2Button) {
		throw new Error("Unable to find the first connecting itinerary standard cabin buttons.");
	}

	await segment1Button.click({ force: true });
	await expect(segment1Button).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });
	await segment2Button.click({ force: true });
	await expect(segment2Button).toHaveAttribute("aria-pressed", "true", { timeout: 10_000 });

	await expect(
		page.getByRole("button", { name: /Proceed to enter Customer Information/i }),
	).toBeVisible({
		timeout: 20_000,
	});
}

export async function beginJourneyFromTopApp(page: Page, options: SearchOptions) {
	const locale = options.locale ?? defaultLocale;
	await registerFlowMocks(page, options);

	await page.goto(e2eTopAppPath.replace("/en/", `/${locale}/`), {
		waitUntil: "domcontentloaded",
		timeout: 60_000,
	});
	await expect(page.getByRole("button", { name: /^Search$/i })).toBeVisible();

	if (options.tripType === "one-way") {
		await page.getByRole("radio", { name: /^One way$/i }).check({ force: true });
	}

	if (options.origin !== "NRT") {
		await openOriginPicker(page, options.origin);
	}
	await openArrivalPicker(page, options.destination);

	await openDatePicker(page, options.tripType);
	await selectDate(page, options.departureDate, options.allowFirstAvailableDeparture ?? false);

	if (options.tripType === "round-trip" && options.returnDate) {
		await selectDate(page, options.returnDate);
	}

	await page.getByRole("button", { name: /^Confirm$/i }).click();
	await page.getByRole("button", { name: /^Search$/i }).click();

	const passportNextButton = page.getByRole("button", { name: /^Next$/i });
	if (await passportNextButton.isVisible().catch(() => false)) {
		await passportNextButton.click();
	}

	await waitForRoute(page, /localhost:3000\/booking\/en\/flight-selection\?/i);
	await expect(page.getByRole("heading", { name: /^Flight$/i, level: 1 })).toBeVisible();
	await expect(page.getByRole("list", { name: /Progress steps/i })).toBeVisible();
}

export async function completeFlow(page: Page, flow: "one-way" | "roundtrip" | "connecting") {
	const stages = getJourneyStages(flow);

	if (flow === "connecting") {
		await selectConnectingFlightCards(page);
	} else {
		for (const stage of stages) {
			await selectFlightCard(page, stage.sectionHeading);
		}
	}

	await page.getByRole("button", { name: /Proceed to enter Customer Information/i }).click();
	await expect(page.getByRole("heading", { name: /Enter the passenger's name/i })).toBeVisible();
	await page.locator("#passenger-0-lastName").fill("ADULTA");
	await page.locator("#passenger-0-firstName").fill("RAJA");
	await page.getByRole("button", { name: /Confirm and Proceed/i }).click();

	for (let index = 0; index < stages.length; index++) {
		const stage = stages[index];
		await waitForRoute(page, new RegExp(`/booking/en/bundles/${stage.route}$`, "i"));
		await ensureBundlePageReady(page, stage.pageHeading);
		await selectNoBundle(page);
		await proceedTo(page, new RegExp(`/booking/en/customize/${stage.route}$`, "i"));

		await expect(
			page.getByRole("heading", { name: /Ancillary \(Air\/Travel\)/i, level: 1 }),
		).toBeVisible({
			timeout: 25_000,
		});
		await expect(
			page.getByRole("heading", { name: new RegExp(getStageLabel(stage.route), "i"), level: 2 }),
		).toBeVisible({ timeout: 25_000 });
		await proceedTo(page, new RegExp(`/booking/en/extras/${stage.route}$`, "i"));

		await expect(
			page.getByRole("heading", {
				name: new RegExp(`${getStageLabel(stage.route)} Ancillary - Optional Services`, "i"),
				level: 1,
			}),
		).toBeVisible({ timeout: 25_000 });

		const nextRoute = stages[index + 1]?.route;
		if (nextRoute) {
			await proceedTo(page, new RegExp(`/booking/en/bundles/${nextRoute}$`, "i"));
		} else {
			await proceedTo(page, /\/booking\/en\/customer-information$/i);
		}
	}

	await expect(page.getByRole("heading", { name: /Customer Information/i, level: 1 })).toBeVisible({
		timeout: 25_000,
	});
}

export async function expectCustomerInformation(page: Page) {
	await expect(
		page.getByRole("heading", { name: /Customer Information/i, level: 1 }),
	).toBeVisible();
	await expect(page.getByRole("button", { name: /^Add Info$/i }).first()).toBeVisible();
	await expect(page).toHaveURL(/\/booking\/en\/customer-information$/i);
}

export async function clickIfVisible(locator: Locator) {
	if (await locator.isVisible().catch(() => false)) {
		await locator.click({ force: true });
	}
}
