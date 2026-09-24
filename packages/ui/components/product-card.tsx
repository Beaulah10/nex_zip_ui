import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { Button } from "./button";

export interface ProductCardProps {
	imageSrc: string;
	imageAlt?: string;
	/** e.g. "Highly chosen" */
	badgeLabel?: string;
	name: string;
	price: number;
	originalPrice?: number;
	disabled?: boolean;
	onAddToCart?: () => void;
	className?: string;
}

function ProductCard({
	imageSrc,
	imageAlt,
	badgeLabel,
	name,
	price,
	originalPrice,
	disabled,
	onAddToCart,
	className,
}: ProductCardProps) {
	return (
		<div
			className={cn(
				"flex w-full max-w-61 flex-col overflow-hidden rounded-lg border border-base-300 bg-white",
				className,
			)}
		>
			<div className="relative">
				<img
					src={imageSrc}
					alt={imageAlt ?? name}
					className="aspect-[244/180] w-full object-cover"
				/>
				{badgeLabel && (
					<Badge className="absolute top-2 left-4 bg-primary-600 text-white">{badgeLabel}</Badge>
				)}
			</div>

			<div className="flex flex-col items-start gap-4 p-4">
				<div className="flex w-full items-center justify-between gap-2">
					<span className="line-clamp-3 min-w-0 flex-1 font-bold text-base text-brand-japan-black leading-6">
						{name}
					</span>
					<div className="flex shrink-0 items-center gap-2">
						{originalPrice !== undefined && (
							<span className="text-base-400 text-sm leading-6 line-through">
								¥{originalPrice.toLocaleString()}
							</span>
						)}
						<span className="font-bold text-primary-700 text-sm leading-6">
							¥{price.toLocaleString()}
						</span>
					</div>
				</div>

				<Button
					type="button"
					variant="primary"
					outline
					size="md"
					className="w-full"
					disabled={disabled}
					onClick={onAddToCart}
				>
					{disabled ? "Sold Out" : "Add to Cart"}
				</Button>
			</div>
		</div>
	);
}

export { ProductCard };
