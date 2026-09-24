import type { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { AmenitiesIcon } from "@/assets/images/amenities-icon";
import { CloseIcon } from "@/assets/images/close-icon";
import { BUNDLE_CODES } from "@/modules/utils/constants/bundle/bundle.constants";
import type { BundleId, BundleOption, FeatureRow } from "@/types/bundle/bundle.types";

type BundlePageTranslator = ReturnType<typeof useTranslations>;

const getBundleName = (t: BundlePageTranslator, bundleId: BundleId) => {
	if (BUNDLE_CODES.NO_BUNDLE.includes(bundleId)) return t("bundle_names_no_bundle");
	if (BUNDLE_CODES.FLEX_BIZ.includes(bundleId)) return t("bundle_names_flex_biz");
	if (BUNDLE_CODES.PREMIUM.includes(bundleId)) {
		return t("bundle_names_premium");
	}

	return t("bundle_names_value");
};

const getDescription = (t: BundlePageTranslator, bundleId: BundleId) => {
	if (BUNDLE_CODES.NO_BUNDLE.includes(bundleId)) {
		return (
			<>
				{t("bundle_options_no_bundle_description_line_1")}
				<br />
				{t("bundle_options_no_bundle_description_line_2")}
			</>
		);
	}

	if (BUNDLE_CODES.FLEX_BIZ.includes(bundleId)) {
		return <>{t("bundle_options_flex_biz_description_line_1")}</>;
	}

	return <>{t("bundle_options_value_description_line_1")}</>;
};

const getPremiumDescription = (t: BundlePageTranslator) => (
	<>{t("bundle_options_premium_description_line_1")}</>
);

export function getTranslatedBundleOptions(
	t: BundlePageTranslator,
	isICNRoute: boolean
): BundleOption[] {
	if (isICNRoute) {
		return [
			{
				id: "NOBN",
				name: getBundleName(t, "NOBN"),
				description: getDescription(t, "NOBN"),
				price: 0,
			},
			{
				id: "VALK",
				name: getBundleName(t, "VALK"),
				description: getDescription(t, "VALK"),
				price: 0,
			},
			{
				id: "PRMK",
				name: getBundleName(t, "PRMK"),
				description: getPremiumDescription(t),
				price: 0,
				badge: t("bundle_options_most_popular_badge"),
			},
		];
	}

	return [
		{
			id: "NOBN",
			name: getBundleName(t, "NOBN"),
			description: getDescription(t, "NOBN"),
			price: 0,
		},
		{
			id: "VALN",
			name: getBundleName(t, "VALN"),
			description: getDescription(t, "VALN"),
			price: 0,
		},
		{
			id: "PREN",
			name: getBundleName(t, "PREN"),
			description: getPremiumDescription(t),
			price: 0,
			badge: t("bundle_options_most_popular_badge"),
		},
		{
			id: "FLBS",
			name: getBundleName(t, "FLBS"),
			description: getDescription(t, "FLBS"),
			price: 0,
		},
	];
}

const unavailableFeatureIcon = <CloseIcon className="inline-block size-4.5 align-middle" />;

const getFeatureValues = (values: Record<string, ReactNode>) => ({
	NOBN: values.noBundle,
	FLBF: values.flexBizz,
	FLBS: values.flexBizz,
	PREM: values.premium,
	PREN: values.premium,
	PRMB: values.premium,
	PRMI: values.premium,
	PRMK: values.premium,
	PRMT: values.premium,
	VALB: values.value,
	VALI: values.value,
	VALK: values.value,
	VALN: values.value,
	VALT: values.value,
	VALU: values.value,
});

export function getTranslatedBundleFeatures(
	t: BundlePageTranslator,
	isICNRoute: boolean
): FeatureRow[] {
	const features: FeatureRow[] = [
		{
			icon: "flight_class",
			label: t("bundle_features_seat"),
			values: getFeatureValues({
				noBundle: t("bundle_features_seat_no_bundle"),
				flexBizz: t("bundle_features_seat_included"),
				premium: t("bundle_features_seat_included"),
				value: t("bundle_features_seat_included"),
			}),
		},
		{
			icon: "restaurant",
			label: t("bundle_features_meal"),
			values: getFeatureValues({
				noBundle: unavailableFeatureIcon,
				flexBizz: unavailableFeatureIcon,
				premium: t("bundle_features_included"),
				value: t("bundle_features_included"),
			}),
		},
		{
			icon: "trip",
			label: t("bundle_features_carry_on"),
			values: getFeatureValues({
				noBundle: t("bundle_features_carry_on_no_bundle"),
				flexBizz: t("bundle_features_carry_on_flex_biz"),
				premium: t("bundle_features_carry_on_premium"),
				value: t("bundle_features_carry_on_value"),
			}),
		},
		{
			icon: "luggage",
			label: t("bundle_features_checked_baggage"),
			values: getFeatureValues({
				noBundle: unavailableFeatureIcon,
				flexBizz: unavailableFeatureIcon,
				premium: t("bundle_features_included"),
				value: t("bundle_features_included"),
			}),
		},
		{
			icon: "airplane_ticket",
			label: t("bundle_features_refund"),
			values: getFeatureValues({
				noBundle: unavailableFeatureIcon,
				flexBizz: t("bundle_features_included"),
				premium: unavailableFeatureIcon,
				value: unavailableFeatureIcon,
			}),
		},
		{
			icon: <AmenitiesIcon className="text-primary-700" aria-hidden focusable={false} />,
			label: t("bundle_features_amenities"),
			values: getFeatureValues({
				noBundle: unavailableFeatureIcon,
				flexBizz: unavailableFeatureIcon,
				premium: t("bundle_features_included"),
				value: unavailableFeatureIcon,
			}),
		},
		{
			icon: "wifi",
			label: t("bundle_features_wifi"),
			values: getFeatureValues({
				noBundle: t("bundle_features_free"),
				flexBizz: t("bundle_features_free"),
				premium: t("bundle_features_free"),
				value: t("bundle_features_free"),
			}),
		},
	];

	if (isICNRoute) {
		return features.map((feature) => {
			if (feature.label === t("bundle_features_seat")) {
				return {
					...feature,
					values: getFeatureValues({
						noBundle: t("bundle_features_seat_no_bundle_not_included"),
						flexBizz: unavailableFeatureIcon,
						premium: t("bundle_features_included"),
						value: t("bundle_features_included"),
					}),
				};
			}
			if (feature.label === t("bundle_features_meal")) {
				return {
					...feature,
					values: getFeatureValues({
						noBundle: unavailableFeatureIcon,
						flexBizz: unavailableFeatureIcon,
						premium: t("bundle_features_included"),
						value: unavailableFeatureIcon,
					}),
				};
			}

			if (feature.label === t("bundle_features_amenities")) {
				return {
					...feature,
					values: getFeatureValues({
						noBundle: unavailableFeatureIcon,
						flexBizz: unavailableFeatureIcon,
						premium: unavailableFeatureIcon,
						value: unavailableFeatureIcon,
					}),
				};
			}

			return feature;
		});
	}

	return features;
}
