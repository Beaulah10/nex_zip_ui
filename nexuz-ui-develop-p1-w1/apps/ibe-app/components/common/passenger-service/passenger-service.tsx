import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import { InfantIcon } from "@/assets/images/infant-icon";
import { formatPrice } from "@/modules/utils/helpers/currency-formatter";
import type { PaxCardProps } from "@/types/common/passenger-service.types";

function PassengerService({
	name,
	bundleLabelKey,
	showAddButton = false,
	features,
	totalPrice,
	categories,
	onAdd,
	onChange,
	className,
	adultType,
}: PaxCardProps) {
	const isSelected = totalPrice !== undefined;
	const t = useTranslations("ancillary_service");
	const baggageServiceLabel = useTranslations("baggage_service");
	const actionButton =
		isSelected && !showAddButton ? (
			<Button
				type="button"
				variant="primary"
				className="border-primary-600 px-6"
				outline
				size="md"
				onClick={onChange}
				aria-label={`Change service selection for ${name}`}
			>
				{t("change_button")}
			</Button>
		) : (
			<Button
				type="button"
				variant="primary"
				className="border-primary-600 px-6"
				outline
				size="md"
				onClick={onAdd}
				aria-label={`Add service selection for ${name}`}
			>
				{t("add_button")}
			</Button>
		);

	return (
		<div
			className={cn(
				"flex w-full flex-col gap-4 rounded-lg border border-base-300 bg-white px-2 py-4 md:p-4",
				className
			)}
		>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex flex-1 items-start gap-2">
					{adultType && adultType.toLowerCase() === "infant" ? (
						<InfantIcon className="mt-1 text-primary-700" />
					) : (
						<Icon
							aria-hidden="true"
							name="person"
							size={24}
							fill={1}
							className="shrink-0 py-1 text-primary-700"
						/>
					)}

					<div className="flex flex-col gap-1 md:w-full md:flex-row md:items-center md:justify-between">
						<div className="flex flex-col items-start gap-1">
							<span className="font-bold text-brand-japan-black text-xl leading-8">{name}</span>
							<Badge variant="info">{t(bundleLabelKey)}</Badge>
						</div>
						{isSelected && (
							<div>
								<span className="font-bold text-2xl text-primary-700 leading-9">
									{formatPrice(totalPrice)}
								</span>
							</div>
						)}
					</div>
				</div>

				{isSelected ? (
					<div className="flex gap-4 self-start md:self-center">{actionButton}</div>
				) : (
					actionButton
				)}
			</div>

			{isSelected && <div className="h-px w-full bg-base-300" />}

			{features && features.length > 0 && (
				<Alert variant="info" icon={false}>
					<AlertDescription>
						<ul className="flex flex-col gap-1 pl-4">
							{features.map((feature) => (
								<li key={feature} className="list-disc marker:text-info-800">
									{t(feature)}
								</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{isSelected && categories && categories.length > 0 && (
				<div className="flex flex-col gap-4 md:pl-8">
					{categories.map((category, index) => (
						<div
							key={category.title ?? index}
							className={`flex flex-col ${category.title === baggageServiceLabel("passenger_list_carry_on_baggage") || category.title === baggageServiceLabel("passenger_list_checked_in_baggage") ? "gap-1" : "gap-2"}`}
						>
							{category.title && (
								<h4
									className={`font-bold text-primary-700 ${category.title === baggageServiceLabel("passenger_list_sports_equipment") ? "text-base leading-6" : "text-lg leading-7"}`}
								>
									{category.title}
								</h4>
							)}
							{category.items.map((item) => (
								<div key={item.label} className="flex flex-col gap-2">
									<div className="flex items-center justify-between gap-4">
										<span className="font-bold text-brand-japan-black text-sm leading-6">
											{item.label}
										</span>
										<span className="font-bold text-primary-700 text-xl leading-8">
											{formatPrice(item.price)}
										</span>
									</div>
									{/* time for serving is commented out for now, as it is not part of the current requirements. If needed, it can be uncommented and used in the future. */}
									{/* {item.servingTime && (
										<div className="flex items-center gap-2">
											<span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-700">
												<Icon name="schedule" size={14} color="" className="text-white" />
											</span>
											<span className="text-sm leading-6">
												<span className="font-bold text-primary-700">Time for serving: </span>
												<span className="text-base-700">{item.servingTime}</span>
											</span>
										</div>
									)} */}
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export { PassengerService };
