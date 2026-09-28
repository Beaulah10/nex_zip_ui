/**
 * File: country.constants.ts
 * Description: Country constants and configuration used across customer information and travel-related forms.
 * It provides country options, phone country mappings, locale mappings, and priority country configurations for country and phone code selection.
 */

export const LOCALE_MAPPING: Record<string, string> = {
	"ja-jp": "ja",
	jp: "ja",
	"zh-cn": "zh",
	"zh-tw": "zh",
};

export const COUNTRY_PRIORITY_CODES = ["us", "jp", "kr", "tw", "ph", "th", "sg", "us", "ca"];

export const PHONE_PRIORITY_CODES = ["us"];

export const RADIX_COUNTRY_OVERRIDES: Record<
	string,
	{
		name: string;
		alpha3: string;
	}
> = {
	vg: { name: "British Virgin Islands", alpha3: "VBG" },
	bq: { name: "Caribbean Netherlands", alpha3: "BQ" },
	cn: { name: "China", alpha3: "CHN" },
	cw: { name: "Curaçao", alpha3: "CW" },
	fm: { name: "Federated States of Micronesia", alpha3: "FSM" },
	tf: { name: "French Southern and Antarctic Lands", alpha3: "ATF" },
	hk: { name: "Hong Kong (SAR of China)", alpha3: "HKG" },
	ir: { name: "Iran", alpha3: "IRN" },
	xk: { name: "Kosovo", alpha3: "SCG" },
	la: { name: "Laos", alpha3: "LAO" },
	mo: { name: "Macau (SAR of China)", alpha3: "MAC" },
	mk: { name: "North Macedonia", alpha3: "MKD" },
	ps: { name: "Palestine", alpha3: "PSE" },
	ru: { name: "Russia", alpha3: "RUS" },
	mf: { name: "Saint Martin", alpha3: "MAF" },
	pm: { name: "Saint-Pierre et Miquelon", alpha3: "SPM" },
	tz: { name: "Tanzania", alpha3: "TZA" },
	bs: { name: "The Bahamas", alpha3: "BHS" },
	gm: { name: "The Gambia", alpha3: "GMG" },
	tr: { name: "Turkey", alpha3: "TUR" },
	vi: { name: "U.S. Virgin Islands", alpha3: "VIR" },
	ae: { name: "UAE", alpha3: "ARE" },
	va: { name: "Vatican City", alpha3: "VAT" },
};

type ExtraCountry = {
	code: string;
	name: string;
	alpha3: string;
};

type ExtraPhoneCountry = {
	code: string;
	name: string;
	dialCode: string;
};

export const EXTRA_RADIX_COUNTRIES: ExtraCountry[] = [
	{
		code: "an",
		name: "Netherlands Antilles",
		alpha3: "ANT",
	},
];

export const RADIX_PHONE_COUNTRY_OVERRIDES: Record<
	string,
	{
		name: string;
		dialCode: string;
	}
> = {
	us: { name: "United States", dialCode: "+1" },
	hk: { name: "Hong Kong (SAR of China)", dialCode: "+852" },
	tw: { name: "Taiwan", dialCode: "+886" },
	aq: { name: "Antarctica", dialCode: "+672" },
	vg: { name: "British Virgin Islands", dialCode: "+1" },
	bn: { name: "Brunei", dialCode: "+673" },
	cn: { name: "China", dialCode: "+86" },
	cz: { name: "Czechia", dialCode: "+420" },
	ci: { name: "Côte d'Ivoire", dialCode: "+225" },
	fk: { name: "Falkland Islands (Islas Malvinas)", dialCode: "+500" },
	fm: { name: "Federated States of Micronesia", dialCode: "+691" },
	ir: { name: "Iran", dialCode: "+98" },
	la: { name: "Laos", dialCode: "+856" },
	mo: { name: "Macau (SAR of China)", dialCode: "+853" },
	md: { name: "Moldova", dialCode: "+373" },
	mk: { name: "North Macedonia", dialCode: "+389" },
	pw: { name: "Palao", dialCode: "+680" },
	ps: { name: "Palestine", dialCode: "+970" },
	pn: { name: "Pitcairn Islands", dialCode: "+64" },
	ru: { name: "Russia", dialCode: "+7" },
	re: { name: "Réunion", dialCode: "+262" },
	mf: { name: "Saint Martin", dialCode: "+1" },
	pm: { name: "Saint-Pierre et Miquelon", dialCode: "+508" },
	sy: { name: "Syria", dialCode: "+963" },
	tz: { name: "Tanzania", dialCode: "+255" },
	bs: { name: "The Bahamas", dialCode: "+1" },
	gm: { name: "The Gambia", dialCode: "+220" },
	tr: { name: "Turkey", dialCode: "+90" },
	vi: { name: "U.S. Virgin Islands", dialCode: "+1" },
	ae: { name: "UAE", dialCode: "+971" },
	va: { name: "Vatican City", dialCode: "+379" },
};

export const EXTRA_RADIX_PHONE_COUNTRIES: ExtraPhoneCountry[] = [
	{
		code: "an",
		name: "Netherlands Antilles",
		dialCode: "+599",
	},
];
