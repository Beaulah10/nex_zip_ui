import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@repo/ui/components/dialog";
import Icon from "@repo/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@repo/ui/components/item";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { useTranslations } from "next-intl";
import { useState } from "react";
import MenuItem from "@/components/flight-search/location/menu-item/menu-item";
import { getMessageAirportByIata } from "@/modules/utils/helpers/flight-search/flight-search.helpers";
import type { IataProps, MessageAirport } from "@/types/flight-search/flight-search.types";

const DepartureModal = ({ iata, value, onClick }: IataProps) => {
	const t = useTranslations("flight_search_page");
	const airports = t.raw("lists.airports") as MessageAirport[];
	const result = getMessageAirportByIata(airports, value);
	const [isTooltipOpen, setIsTooltipOpen] = useState(false);

	const departureTooltipValue = result?.airport ? `${result.airport}` : value;

	return (
		<div className="flex flex-1 flex-col rounded-lg border border-secondary-300 bg-white">
			<Dialog>
				<Tooltip open={isTooltipOpen}>
					<TooltipTrigger asChild>
						<DialogTrigger asChild>
							<Item
								asChild
								className={
									"flex-1 cursor-pointer gap-2 rounded-lg border-0 px-4 py-3 text-left transition-colors hover:bg-base-50"
								}
							>
								<button
									type="button"
									onPointerEnter={() => setIsTooltipOpen(true)}
									onPointerLeave={() => setIsTooltipOpen(false)}
									onFocus={() => setIsTooltipOpen(false)}
									onBlur={() => setIsTooltipOpen(false)}
								>
									<ItemContent>
										<div className="flex items-center gap-2">
											<Icon
												name="trip_origin"
												size={24}
												fill={1}
												wght={400}
												grad={0}
												opsz={24}
												color=""
												className="shrink-0 text-primary-600"
											/>
											{value ? (
												<div>
													<ItemTitle className="font-normal text-brand-japan-black text-xl leading-8">
														{result?.city} ({value})
													</ItemTitle>
													<ItemDescription className="text-xs leading-5">
														{result?.airport} ({result?.country}){" "}
													</ItemDescription>
												</div>
											) : (
												<span className="line-clamp-1 text-base-400 text-xl leading-8">
													{t("placeholder_departure")}
												</span>
											)}
										</div>
									</ItemContent>
									<ItemActions>
										<Icon
											name="arrow_drop_down"
											size={20}
											fill={0}
											wght={400}
											grad={0}
											opsz={20}
											color=""
											className="text-primary-600"
										/>
									</ItemActions>
								</button>
							</Item>
						</DialogTrigger>
					</TooltipTrigger>
					<TooltipContent>
						<p>
							{t("departure_selected", {
								value: departureTooltipValue || t("placeholder_departure"),
							})}
						</p>
					</TooltipContent>
				</Tooltip>
				<DialogContent desktopWidth={640} className="gap-0" aria-describedby={undefined}>
					<DialogHeader className="border-secondary-300 bg-white">
						<DialogTitle>{t("departure_modal_heading")}</DialogTitle>
					</DialogHeader>

					<section
						className="no-scrollbar grid max-h-[80vh] grid-cols-1 overflow-y-auto p-4 md:grid-cols-2"
						aria-label={t("departure_modal_heading")}
					>
						{iata.map((item: string) => (
							<DialogClose asChild key={item}>
								<MenuItem item={item} value={value} onClick={onClick} />
							</DialogClose>
						))}
					</section>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DepartureModal;
