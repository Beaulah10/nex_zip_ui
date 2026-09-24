function formatDateKey(d: Date) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatMonthKey(d: Date) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatPrice(amount: number) {
	return `¥${amount.toLocaleString("en-US")}`;
}

function hashString(input: string) {
	let hash = 0;
	for (let i = 0; i < input.length; i += 1) {
		hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
	}
	return hash;
}

function randomFromSeed(seed: number) {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(min, value));
}

function monthBasePrice(month: number) {
	// Month index: 0 = Jan ... 11 = Dec
	const monthlyBase = [
		41800, 39200, 40500, 43800, 47200, 52500, 64800, 67200, 54800, 48600, 45200, 59800,
	];
	return monthlyBase[month] ?? 41800;
}

function buildNoPriceDaysByMonth(startDate: Date, dayCount: number) {
	const daysByMonth = new Map<string, number[]>();

	for (let i = 0; i < dayCount; i += 1) {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + i);

		const monthKey = formatMonthKey(date);
		const existing = daysByMonth.get(monthKey) ?? [];
		existing.push(date.getDate());
		daysByMonth.set(monthKey, existing);
	}

	const noPriceByMonth = new Map<string, Set<number>>();

	daysByMonth.forEach((dayList, monthKey) => {
		const unavailableCount = clamp(Math.round(dayList.length * 0.12), 2, 5);
		const selected = new Set<number>();
		let seed = hashString(monthKey);

		while (selected.size < unavailableCount) {
			seed += 1;
			const index = Math.floor(randomFromSeed(seed) * dayList.length);
			const dayNumber = dayList[index];
			if (dayNumber !== undefined) {
				selected.add(dayNumber);
			}
		}

		noPriceByMonth.set(monthKey, selected);
	});

	return noPriceByMonth;
}

function buildSamplePrices(startDate: Date, dayCount: number): Record<string, string> {
	const prices: Record<string, string> = {};
	const noPriceDaysByMonth = buildNoPriceDaysByMonth(startDate, dayCount);

	for (let i = 0; i < dayCount; i += 1) {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + i);

		const monthKey = formatMonthKey(date);
		const noPriceDays = noPriceDaysByMonth.get(monthKey);

		if (noPriceDays?.has(date.getDate())) {
			continue;
		}

		const monthBase = monthBasePrice(date.getMonth());
		const day = date.getDay();
		const weekdayAdjustments = [8000, -1500, -2500, -2200, 1200, 9800, 12500];
		const dateSeed = hashString(formatDateKey(date));
		const randomJitter = Math.round((randomFromSeed(dateSeed) - 0.5) * 10000);
		const weekdayAdjustment = weekdayAdjustments[day] ?? 0;
		const amount = Math.max(19800, monthBase + weekdayAdjustment + randomJitter);

		prices[formatDateKey(date)] = formatPrice(amount);
	}

	return prices;
}

function buildSamplePromoPrices(prices: Record<string, string>): Record<string, string> {
	const promos: Record<string, string> = {};

	for (const [key, originalPrice] of Object.entries(prices)) {
		const match = originalPrice.match(/[\d,]+/);
		if (!match) continue;

		const amount = parseInt(match[0].replace(/,/g, ""), 10);
		const discountSeed = hashString(`${key}-discount`);
		const discountFactor = 0.6 + randomFromSeed(discountSeed) * 0.25; // 60–85% of original
		const promoAmount = Math.round((amount * discountFactor) / 100) * 100;

		promos[key] = formatPrice(promoAmount);
	}

	return promos;
}

const start = new Date();
start.setHours(0, 0, 0, 0);

// Covers the full date picker range (today through the next 12 months).
export const SAMPLE_PRICES: Record<string, string> = buildSamplePrices(start, 366);

/** Promotional (discounted) price for every date that has a regular price. */
export const SAMPLE_PROMO_PRICES: Record<string, string> = buildSamplePromoPrices(SAMPLE_PRICES);
