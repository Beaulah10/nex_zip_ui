"use client";

import { Button } from "@repo/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@repo/ui/components/dialog";
import BundleOfferOverview from "@/components/bundle/bundle-package-selection/bundle-offer-overview/bundle-offer-overview";
import BundlePackageSelectionAlerts from "@/components/bundle/bundle-package-selection/bundle-package-selection-alerts/bundle-package-selection-alerts";
import PassengerBundleSelection from "@/components/bundle/bundle-package-selection/passenger-bundle-selection/passenger-bundle-selection";
import { useBundlePackageSelection } from "@/modules/hooks/bundle/use-bundle-package-selection/use-bundle-package-selection";
import type { BundlePackageSelectionProps } from "@/types/bundle/bundle.types";

/** Bundle package selection page body. */
export default function BundlePackageSelection({
	locale,
	direction = "outbound",
	isICNRoute,
	onProceed,
}: BundlePackageSelectionProps) {
	const vm = useBundlePackageSelection({ locale, direction, isICNRoute, onProceed });

	return (
		<main className="flex w-full flex-col gap-6 pt-6 pb-32 md:px-0">
			<BundlePackageSelectionAlerts {...vm.alertProps} />
			<BundleOfferOverview {...vm.offerOverviewProps} />
			<div className="flex w-full flex-col gap-8">
				<PassengerBundleSelection {...vm.passengerSelectionProps} />
			</div>
			{vm.confirmationChangeDialog ? (
				<Dialog
					open={vm.confirmationChangeDialog.open}
					onOpenChange={vm.confirmationChangeDialog.onOpenChange}
				>
					<DialogContent
						desktopWidth={640}
						onOpenAutoFocus={(event) => event.preventDefault()}
						onInteractOutside={(event) => event.preventDefault()}
						onEscapeKeyDown={(event) => event.preventDefault()}
						className="gap-0 rounded-lg border border-base-200"
					>
						<DialogHeader className="border-none px-4 py-6 md:p-8" showCloseButton={false}>
							<DialogTitle>{vm.confirmationChangeDialog.title}</DialogTitle>
						</DialogHeader>
						<div className="px-4 pb-2 text-base text-secondary-700 leading-6 md:px-8 md:pb-4">
							{vm.confirmationChangeDialog.content}
						</div>
						<DialogFooter className="border-none px-4 py-6 md:px-8 md:py-8">
							<Button
								variant="primary"
								outline
								size="md"
								className="w-full md:w-auto"
								onClick={vm.confirmationChangeDialog.onCancel}
							>
								{vm.confirmationChangeDialog.cancelLabel}
							</Button>
							<Button
								variant="primary"
								size="md"
								className="w-full md:w-auto"
								onClick={vm.confirmationChangeDialog.onConfirm}
							>
								{vm.confirmationChangeDialog.confirmLabel}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			) : null}
		</main>
	);
}
