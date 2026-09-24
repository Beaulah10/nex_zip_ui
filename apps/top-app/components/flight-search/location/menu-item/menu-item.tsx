import Icon from "@repo/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@repo/ui/components/item";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { getMessageAirportByIata } from "@/modules/utils/helpers/flight-search/flight-search.helpers";
import type { MenuItemProps, MessageAirport } from "@/types/flight-search/flight-search.types";

const MenuItem = ({ item, value, isViaTokyoNarita, onClick }: MenuItemProps) => {
	const t = useTranslations("flight_search_page");
	const airports = t.raw("lists.airports") as MessageAirport[];
	const result = getMessageAirportByIata(airports, item);

	return (
		<Item
			asChild
			variant="default"
			className={cn(
				"cursor-pointer gap-3 rounded-lg border-0 p-3 text-left hover:bg-primary-200",
				item === value && "bg-primary-200"
			)}
		>
			<button
				type="button"
				onClick={() => {
					onClick(item);
				}}
			>
				<ItemContent className="gap-1">
					<ItemTitle className="font-bold text-lg text-primary-700 leading-7">
						{result?.city} ({item})
					</ItemTitle>
					<ItemDescription className="text-secondary-700 text-xs leading-5">
						{result?.airport} ({result?.country}) {isViaTokyoNarita && t("via_tokyo_narita")}
					</ItemDescription>
				</ItemContent>

				{item === value && (
					<ItemActions>
						<Icon
							name="check_circle"
							size={24}
							fill={1}
							wght={400}
							grad={0}
							opsz={24}
							color="text-primary-700"
							className="shrink-0"
						/>
					</ItemActions>
				)}
			</button>
		</Item>
	);
};

export default MenuItem;
