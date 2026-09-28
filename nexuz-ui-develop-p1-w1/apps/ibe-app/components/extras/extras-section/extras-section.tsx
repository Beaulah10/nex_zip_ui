import { Badge } from "@repo/ui/components/badge";
import Icon from "@repo/ui/components/icon";
import { cn } from "@repo/ui/lib";
import { useTranslations } from "next-intl";
import type { ExtrasSectionProps } from "@/types/extras/extras.type";

export function ExtrasSection({
	title,
	products,
	bundledPassengerIdsByProductId,
	selectedProductIds = [],
	onCardClick,
}: ExtrasSectionProps) {
	const handleCardClick = (productId: string) => {
		onCardClick?.(productId);
	};

	const t = useTranslations("extras_page");

	return (
		<>
			{products.length > 0 && (
				<>
					<h3 className="font-bold text-lg text-primary-700 leading-7">{title}</h3>

					<div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{products.map((product) => {
							const isDisabled = Boolean(product.disabled);
							const hasPremiumBundle = product.inPremiumBundle;

							return (
								<button
									key={product.id}
									type="button"
									disabled={isDisabled}
									onClick={() => {
										if (!isDisabled) {
											handleCardClick(product.id);
										}
									}}
								>
									<div
										className={cn(
											"flex w-full flex-col items-start gap-2 rounded-lg border p-2 text-left outline-none md:max-w-49.5",
											isDisabled
												? "cursor-not-allowed border-base-300 bg-base-100 opacity-40"
												: selectedProductIds.includes(product.id)
													? "cursor-pointer border-primary-600 bg-primary-50"
													: "cursor-pointer border-base-300 bg-white"
										)}
									>
										<div className="relative w-full">
											<div className="aspect-[176/112] h-30 w-full overflow-hidden rounded-lg border border-base-200 bg-white md:h-28">
												{/* biome-ignore lint/performance/noImgElement: product images use remote URLs */}
												<img
													src={product.imageSrc}
													alt={product.imageAlt ?? product.name}
													className="size-full object-cover"
												/>
											</div>

											{selectedProductIds.includes(product.id) && (
												<span
													aria-hidden="true"
													className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary-700"
												>
													<Icon name="check" size={20} color="text-white" />
												</span>
											)}
										</div>

										<div className="flex w-full flex-col items-start gap-1">
											<p className="line-clamp-1 w-full break-words text-left text-brand-japan-black text-sm leading-6">
												{product.name}
											</p>

											{hasPremiumBundle && (
												<div className="flex w-full items-center">
													<Badge variant="info" className="rounded">
														{bundledPassengerIdsByProductId[product.id]?.length ?? 0}{" "}
														{t("included_in_set")}
													</Badge>
													<span className="ml-auto font-bold text-primary-700 text-sm leading-6">
														¥{product.price.toLocaleString()}
													</span>
												</div>
											)}

											{(product.remainingLabel || !hasPremiumBundle) && (
												<div className="flex w-full items-center">
													{product.remainingLabel && (
														<span className="font-medium text-[10px] text-danger-800 leading-4 md:text-xs md:leading-5">
															{product.remainingLabel}
														</span>
													)}

													{!hasPremiumBundle && (
														<span className="ml-auto font-bold text-primary-700 text-sm leading-6">
															¥{product.price.toLocaleString()}
														</span>
													)}
												</div>
											)}
										</div>
									</div>
								</button>
							);
						})}
					</div>
				</>
			)}
		</>
	);
}
