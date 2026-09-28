"use client";
import { Badge } from "@repo/ui/components/badge";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import Image from "next/image";
import type { ServicePromoCardProps } from "@/types/common.type";

function ServicePromoCard({
	imageSrc,
	imageAlt,
	icon,
	discountLabel,
	title,
	description,
	selectedItemsText,
	freeItemsText,
	reserveStatusSpace,
	className,
}: ServicePromoCardProps) {
	const hasStatusText = Boolean(selectedItemsText || freeItemsText);

	return (
		<div
			className={cn(
				"flex h-full w-full flex-col rounded-lg border border-base-300 bg-white",
				className
			)}
		>
			<div className="relative h-30 w-full overflow-hidden rounded-t-lg md:h-[171px]">
				<Image src={imageSrc} alt={imageAlt ?? title} fill className="object-cover" />
			</div>

			<div className="flex flex-1 flex-col gap-1 px-4 pb-4">
				<div className="-mt-7.5 flex items-end justify-between gap-4">
					<span className="z-1 flex size-15 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.10),0_1px_2px_-1px_rgba(0,0,0,0.10)]">
						<Icon
							name={icon}
							size={36}
							fill={1}
							color=""
							className="text-primary-700"
							aria-hidden="true"
						/>
					</span>
					{discountLabel && <Badge variant="success">{discountLabel}</Badge>}
				</div>

				<div className="flex flex-col items-start gap-1.5">
					<span className="font-bold text-primary-700 text-sm leading-6">{title}</span>
					<p className="font-medium text-base-700 text-xs leading-5">{description}</p>
					{hasStatusText ? (
						<div className="flex flex-col gap-0.5">
							{selectedItemsText && (
								<div className="flex flex-row gap-2">
									<Icon
										name="check_circle"
										size={20}
										fill={1}
										className="text-brand-japan-black"
										color="text-gray-900"
										aria-hidden="true"
									/>
									<span className="font-bold text-brand-japan-black text-xs leading-5">
										{selectedItemsText}
									</span>
								</div>
							)}
							{freeItemsText && (
								<div className="flex flex-row gap-2">
									<Icon name="error" size={20} fill={1} wght={400} grad={0} opsz={20} />
									<span className="font-bold text-primary-700 text-xs leading-5">
										{freeItemsText}
									</span>
								</div>
							)}
						</div>
					) : (
						reserveStatusSpace && <div className="min-h-5" />
					)}
				</div>
			</div>
		</div>
	);
}

export { ServicePromoCard };
