const currencyFormatter = new Intl.NumberFormat("ja-JP", {
	style: "currency",
	currency: "JPY",
	maximumFractionDigits: 0,
});

/**
 * Formats a numeric amount as Japanese Yen currency.
 *
 * Example:
 * - 1000 -> "￥1,000"
 * - 12345 -> "￥12,345"
 *
 * @param amount Amount to format.
 * @returns Currency-formatted string in JPY.
 */
export const formatPrice = (amount: number): string => currencyFormatter.format(amount);
