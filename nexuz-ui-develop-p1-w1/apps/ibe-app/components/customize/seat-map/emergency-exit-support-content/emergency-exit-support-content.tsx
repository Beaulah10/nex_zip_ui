/**
 * File: emergency-exit-support-content.tsx
 * Description: Confirmation dialog shown when a passenger selects an emergency exit row seat.
 * Requires the passenger to acknowledge every eligibility requirement before the seat can be assigned.
 */

"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import Icon from "@repo/ui/components/icon";
import { useTranslations } from "next-intl";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { EmergencyExitSupportContentProps } from "@/types/seat-map/seat-map.types";

export function EmergencyExitSupportContent({
	routeLabel,
	onConfirm,
	onCancel,
}: EmergencyExitSupportContentProps) {
	const t = useTranslations("seat_service");
	const idPrefix = useId();
	const errorBannerRef = useRef<HTMLDivElement>(null);
	const eligibilityChecklistItems = useMemo(
		() => [
			t("eligibility_checklist_item_1"),
			t("eligibility_checklist_item_2"),
			t("eligibility_checklist_item_3"),
			t("eligibility_checklist_item_4"),
			t("eligibility_checklist_item_5"),
			t("eligibility_checklist_item_6"),
			t("eligibility_checklist_item_7"),
			t("eligibility_checklist_item_8"),
			t("eligibility_checklist_item_9"),
			t("eligibility_checklist_item_10"),
			t("eligibility_checklist_item_11"),
		],
		[t]
	);
	const crewInstructionItems = useMemo(
		() => [
			t("crew_instruction_items_item_1"),
			t("crew_instruction_items_item_2"),
			t("crew_instruction_items_item_3"),
			t("crew_instruction_items_item_4"),
			t("crew_instruction_items_item_5"),
		],
		[t]
	);
	const [checkedItems, setCheckedItems] = useState<boolean[]>(() =>
		eligibilityChecklistItems.map(() => false)
	);
	const [showChecklistError, setShowChecklistError] = useState(false);

	useEffect(() => {
		setCheckedItems(eligibilityChecklistItems.map(() => false));
		setShowChecklistError(false);
	}, [eligibilityChecklistItems]);

	const allChecked = checkedItems.every(Boolean);

	const handleAgreeAndSelect = () => {
		if (!allChecked) {
			setShowChecklistError(true);

			requestAnimationFrame(() => {
				errorBannerRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});

				errorBannerRef.current?.focus();
			});

			return;
		}

		setShowChecklistError(false);
		onConfirm();
	};

	const handleCheckedChange = (index: number, checked: boolean) => {
		setCheckedItems((previous) => {
			const updated = previous.map((value, i) => (i === index ? checked : value));

			if (updated.every(Boolean)) {
				setShowChecklistError(false);
			}

			return updated;
		});
	};

	return (
		<>
			<div className="flex flex-shrink-0 items-center gap-6 border-base-300 border-b px-4 py-4 md:px-6">
				<button
					type="button"
					aria-label={t("aria_labels.back_button")}
					onClick={onCancel}
					className="shrink-0 text-base-950"
				>
					<Icon name="arrow_back" size={24} color="" className="text-current" />
				</button>
				<div className="flex flex-1 flex-col gap-1">
					<span className="font-bold text-2xl text-brand-japan-black leading-9">
						{t("emergency_exit_seat_confirmation")}
					</span>
					<span className="text-base-700 text-xs leading-5">{routeLabel}</span>
				</div>
				<button
					type="button"
					aria-label={t("aria_labels.close_button")}
					onClick={onCancel}
					className="flex shrink-0 items-center justify-center rounded-full border border-base-300 bg-white p-3 hover:bg-base-50"
				>
					<Icon name="close" size={24} color="" className="text-brand-japan-black" />
				</button>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="flex flex-col gap-4 p-4 pb-4 md:p-6">
					{showChecklistError && (
						<div ref={errorBannerRef} tabIndex={-1} className="px-4 pt-2 md:px-0">
							<Alert variant="error">
								<AlertDescription>{t("error_labels.checklist_required")}</AlertDescription>
							</Alert>
						</div>
					)}
					<div className="flex flex-col gap-1">
						<h2 className="font-bold text-2xl text-primary-700 leading-9">
							{t("eligibility_title")}
						</h2>

						<p className="text-base-700 text-sm leading-6">{t("eligibility_description")}</p>
					</div>

					<div className="flex flex-col gap-2">
						{eligibilityChecklistItems.map((item, index) => {
							const checkboxId = `${idPrefix}-checklist-${index}`;
							return (
								<div key={item} className="flex items-center gap-4 py-2">
									<Checkbox
										id={checkboxId}
										checked={checkedItems[index]}
										onCheckedChange={(checked) => handleCheckedChange(index, checked === true)}
									/>
									<label
										htmlFor={checkboxId}
										className="cursor-pointer font-medium text-base-900 text-sm leading-6"
									>
										{item}
									</label>
								</div>
							);
						})}
					</div>

					<p className="text-brand-japan-black text-sm leading-6">{t("crew_instruction_intro")}</p>

					<div className="rounded-lg bg-base-100 p-4">
						<ul className="flex list-disc flex-col gap-1 pl-4 text-base-700 text-sm leading-6">
							{crewInstructionItems.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>

					<p className="text-brand-japan-black text-sm leading-6">{t("eligibility_footer")}</p>

					<p className="text-brand-japan-black text-sm leading-6">{t("authority_name")}</p>
				</div>
			</div>

			<div className="flex flex-shrink-0 flex-col-reverse items-center justify-end gap-4 bg-white p-4 md:flex-row md:justify-end md:gap-4 md:p-4 md:px-8">
				<Button
					type="button"
					variant="primary"
					className="h-10 w-full md:h-13 md:w-auto"
					outline
					onClick={onCancel}
				>
					{t("close")}
				</Button>
				<Button
					type="button"
					variant="primary"
					size="xl"
					className="h-10 w-full md:h-13 md:w-auto"
					onClick={handleAgreeAndSelect}
				>
					{t("agree_and_select")}
				</Button>
			</div>
		</>
	);
}
