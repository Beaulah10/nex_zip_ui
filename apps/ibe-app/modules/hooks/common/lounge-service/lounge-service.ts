import BangkokLoungeImage from "@/assets/images/BangkokLounge.webp";
import HonoluluLoungeImage from "@/assets/images/HonoluluLounge.webp";
import NaritaLoungeImage from "@/assets/images/NaritaLounge.webp";
import SingaporeLoungeImage from "@/assets/images/SingaporeLounge.webp";
import type { CustomizeAssets } from "@/modules/utils/helpers/customize/customize-assets";

/**
 * Returns the lounge image corresponding to the origin airport code.
 * Used to dynamically display the correct lounge image for NRT, BKK, SIN, and HNL routes.
 */
export const getAirportLoungeImage = (
	originRoute: string | undefined,
	assets?: CustomizeAssets | undefined
): string => {
	switch (originRoute) {
		case "NRT":
			return assets?.naritaLoungeImage?.url ?? NaritaLoungeImage.src;

		case "BKK":
			return assets?.bangkokLoungeImage?.url ?? BangkokLoungeImage.src;

		case "SIN":
			return assets?.singaporeLoungeImage?.url ?? SingaporeLoungeImage.src;

		case "HNL":
			return assets?.honoluluLoungeImage?.url ?? HonoluluLoungeImage.src;

		default:
			return "";
	}
};
