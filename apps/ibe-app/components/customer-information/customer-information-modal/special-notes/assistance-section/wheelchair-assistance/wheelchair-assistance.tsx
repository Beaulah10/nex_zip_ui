/**
 * File: wheelchair-assistance.tsx
 * Description: Wheelchair assistance information component for passengers requiring special assistance during travel.
 * It manages wheelchair-related support requirements based on passenger selections.
 */

"use client";

import { Badge } from "@repo/ui/components/badge";
import { Field, FieldError, FieldHeader, FieldLabel } from "@repo/ui/components/field";
import { FieldDimensionInput } from "@repo/ui/components/field-inputs";
import { RadioGroup, RadioGroupBorderedItem } from "@repo/ui/components/radio-group";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import {
	BATTERY_TYPES,
	WHEELCHAIR_BATTERY_FIELDS,
	WHEELCHAIR_BRING_OWN_FIELDS,
	WHEELCHAIR_CLEAR_ERRORS_FIELDS,
	WHEELCHAIR_DIMENSION_FIELDS,
	WHEELCHAIR_REASON_FIELDS,
	WHEELCHAIR_REASONS,
	WHEELCHAIR_TYPE_FIELDS,
} from "@/modules/utils/constants/customer-information/constants";
import {
	getFieldErrors,
	handleFieldOnChange,
} from "@/modules/utils/helpers/customer-information/customer-information-utils";
import type { PassengerInformation } from "@/modules/utils/validations/customer-information/customer-information-schema";

// WheelChairAssitance component manages wheelchair-related support requirements based on passenger selections.
export function WheelChairAssitance({ showWheelchair }: { showWheelchair: boolean }) {
	const {
		register,
		control,
		clearErrors,
		setValue,
		trigger,
		formState: { errors },
	} = useFormContext<PassengerInformation>();
	const t = useTranslations("customer_information_page");
	// Watches whether the passenger can walk independently.
	const canWalk = useWatch({ control, name: "canWalk" });
	// Watches whether the passenger can go up and down stairs.
	const canGoUpDownStairs = useWatch({
		control,
		name: "canGoUpDownStairs",
	});

	// Watches whether an onboard wheelchair is required during the flight.
	const needsOnboardWheelchair = useWatch({
		control,
		name: "needsOnboardWheelchair",
	});
	// Watches the selected reason for requesting wheelchair assistance.
	const reasonForWheelchair = useWatch({
		control,
		name: "reasonForWheelchair",
	});
	// Watches whether the passenger is bringing their own wheelchair.
	const bringingOwnWheelchair = useWatch({
		control,
		name: "bringingOwnWheelchair",
	});
	// Watches the type of wheelchair (manual or electric).
	const wheelchairType = useWatch({
		control,
		name: "wheelchairType",
	});
	// Watches whether the wheelchair battery can be removed.
	const batteryRemovable = useWatch({
		control,
		name: "wheelchairBatteryRemovable",
	});
	// Watches the selected battery type for an electric wheelchair.
	const batteryType = useWatch({
		control,
		name: "wheelchairBatteryType",
	});
	// Watches whether the wheelchair is foldable.
	const isFoldable = useWatch({
		control,
		name: "isFoldable",
	});
	// Shows the stairs capability question when wheelchair assistance is needed and the passenger can walk.
	const showStairsQuestion = showWheelchair && canWalk === "yes";
	// Shows the onboard wheelchair question when wheelchair assistance is needed and the passenger cannot walk.
	const showOnboardWheelchair = showWheelchair && canWalk === "no";
	// Shows wheelchair reason options once the walking-related prerequisite question is answered.
	const showWheelchairReason =
		showWheelchair &&
		((canWalk === "yes" && !!canGoUpDownStairs) || (canWalk === "no" && !!needsOnboardWheelchair));
	// Shows the question about bringing a personal wheelchair after a wheelchair reason is selected.
	const showBringOwnWheelchair = showWheelchairReason && !!reasonForWheelchair;
	// Shows wheelchair type selection when the passenger is bringing their own wheelchair.
	const showWheelchairType = showBringOwnWheelchair && bringingOwnWheelchair === "yes";

	// Shows battery-related questions for electric wheelchairs.
	const showBatteryQuestion = showWheelchairType && wheelchairType === "electric";
	// Shows foldable wheelchair question for manual wheelchairs.
	const showFoldable = showWheelchairType && wheelchairType === "manual";
	// Shows wheelchair dimension fields once the required type-specific information is provided.
	const showDimensions =
		showWheelchairType &&
		((wheelchairType === "manual" && !!isFoldable) ||
			(wheelchairType === "electric" && !!batteryType));

	useEffect(() => {
		if (!showWheelchair) {
			clearErrors(WHEELCHAIR_CLEAR_ERRORS_FIELDS);
		}
	}, [clearErrors, showWheelchair]);

	useEffect(() => {
		if (!showDimensions) {
			clearErrors(WHEELCHAIR_DIMENSION_FIELDS);
		}
	}, [clearErrors, showDimensions]);

	useEffect(() => {
		if (!showStairsQuestion) {
			clearErrors("canGoUpDownStairs");
		}
	}, [clearErrors, showStairsQuestion]);

	useEffect(() => {
		if (!showOnboardWheelchair) {
			clearErrors("needsOnboardWheelchair");
		}
	}, [clearErrors, showOnboardWheelchair]);

	useEffect(() => {
		if (!showWheelchairReason) {
			clearErrors(WHEELCHAIR_REASON_FIELDS);
		}
	}, [clearErrors, showWheelchairReason]);

	useEffect(() => {
		if (!showBringOwnWheelchair) {
			clearErrors(WHEELCHAIR_BRING_OWN_FIELDS);
		}
	}, [clearErrors, showBringOwnWheelchair]);

	useEffect(() => {
		if (!showWheelchairType) {
			clearErrors(WHEELCHAIR_TYPE_FIELDS);
		}
	}, [clearErrors, showWheelchairType]);

	useEffect(() => {
		if (!showBatteryQuestion) {
			clearErrors(WHEELCHAIR_BATTERY_FIELDS);
		}
	}, [clearErrors, showBatteryQuestion]);

	useEffect(() => {
		if (!showFoldable) {
			clearErrors("isFoldable");
		}
	}, [clearErrors, showFoldable]);

	// Strip min/max from register return (FieldDimensionInput expects number | undefined)
	const { min: _wh1, max: _wh2, ...wheelchairHeightReg } = register("wheelchairHeight");
	const { min: _ww1, max: _ww2, ...wheelchairWidthReg } = register("wheelchairWidth");
	const { min: _wd1, max: _wd2, ...wheelchairDepthReg } = register("wheelchairDepth");
	const { min: _wt1, max: _wt2, ...wheelchairWeightReg } = register("wheelchairWeight");

	return (
		<>
			<h4 className="font-bold text-lg text-primary-700 leading-7">
				{t("wheelchair_questions_title")}
			</h4>

			{/* Can walk */}
			<Controller
				name="canWalk"
				control={control}
				render={({ field }) => (
					<Field>
						<FieldHeader>
							<FieldLabel id="can-walk-label">{t("question_can_walk")}</FieldLabel>
							<Badge variant="destructive">{t("badge_required")}</Badge>
						</FieldHeader>
						<RadioGroup
							className="grid grid-cols-2 gap-2 md:grid-cols-4"
							value={field.value}
							onValueChange={field.onChange}
						>
							<RadioGroupBorderedItem
								value="yes"
								label={t("label_yes")}
								aria-invalid={!!errors.canWalk}
							/>
							<RadioGroupBorderedItem
								value="no"
								label={t("label_no")}
								aria-invalid={!!errors.canWalk}
							/>
						</RadioGroup>
						<FieldError errors={getFieldErrors(errors.canWalk)} />
					</Field>
				)}
			/>

			{/* Can go up/down stairs */}
			{showStairsQuestion && (
				<Controller
					name="canGoUpDownStairs"
					control={control}
					render={({ field }) => (
						<Field>
							<FieldHeader>
								<FieldLabel id="can-use-stairs-label">{t("question_can_use_stairs")}</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<RadioGroup
								className="grid grid-cols-2 gap-2 md:grid-cols-4"
								value={field.value}
								onValueChange={field.onChange}
								aria-labelledby="can-use-stairs-label"
							>
								<RadioGroupBorderedItem
									value="yes"
									label={t("label_yes")}
									aria-invalid={!!errors.canGoUpDownStairs}
								/>
								<RadioGroupBorderedItem
									value="no"
									label={t("label_no")}
									aria-invalid={!!errors.canGoUpDownStairs}
								/>
							</RadioGroup>
							<FieldError errors={getFieldErrors(errors.canGoUpDownStairs)} />
						</Field>
					)}
				/>
			)}

			{/*C7: ONLY when user CANNOT walk */}
			{showOnboardWheelchair && (
				<Controller
					name="needsOnboardWheelchair"
					control={control}
					render={({ field }) => (
						<Field>
							<FieldHeader>
								<FieldLabel id="needs-onboard-wheelchair-label">
									{t("question_need_onboard_wheelchair")}
								</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<RadioGroup
								className="grid grid-cols-2 gap-2 md:grid-cols-4"
								value={field.value}
								onValueChange={field.onChange}
								aria-labelledby="needs-onboard-wheelchair-label"
							>
								<RadioGroupBorderedItem
									value="yes"
									label={t("label_yes")}
									aria-invalid={!!errors.needsOnboardWheelchair}
								/>
								<RadioGroupBorderedItem
									value="no"
									label={t("label_no")}
									aria-invalid={!!errors.needsOnboardWheelchair}
								/>
							</RadioGroup>
							<FieldError errors={getFieldErrors(errors.needsOnboardWheelchair)} />
						</Field>
					)}
				/>
			)}

			{/* Reason for wheelchair */}
			{showWheelchairReason && (
				<Controller
					name="reasonForWheelchair"
					control={control}
					render={({ field }) => (
						<Field>
							<FieldHeader>
								<FieldLabel id="reason-for-wheelchair-label">
									{t("question_reason_for_wheelchair")}
								</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<RadioGroup
								className="grid grid-cols-1 gap-2 md:grid-cols-3"
								value={field.value}
								onValueChange={field.onChange}
								aria-labelledby="reason-for-wheelchair-label"
							>
								{WHEELCHAIR_REASONS.map((reason) => (
									<RadioGroupBorderedItem
										key={reason.value}
										value={reason.value}
										label={t(reason.label)}
										aria-invalid={!!errors.reasonForWheelchair}
									/>
								))}
							</RadioGroup>
							<FieldError errors={getFieldErrors(errors.reasonForWheelchair)} />
						</Field>
					)}
				/>
			)}

			{/* Bringing own wheelchair */}
			{/* C9: ONLY after selecting wheelchair reason */}
			{showBringOwnWheelchair && (
				<Controller
					name="bringingOwnWheelchair"
					control={control}
					render={({ field }) => (
						<Field>
							<FieldHeader>
								<FieldLabel id="bring-own-wheelchair-label">
									{t("question_bring_own_wheelchair")}
								</FieldLabel>
								<Badge variant="destructive">{t("badge_required")}</Badge>
							</FieldHeader>
							<RadioGroup
								className="grid grid-cols-2 gap-2 md:grid-cols-4"
								value={field.value}
								onValueChange={field.onChange}
								aria-labelledby="bring-own-wheelchair-label"
							>
								<RadioGroupBorderedItem
									value="yes"
									label={t("label_yes")}
									aria-invalid={!!errors.bringingOwnWheelchair}
								/>
								<RadioGroupBorderedItem
									value="no"
									label={t("label_no")}
									aria-invalid={!!errors.bringingOwnWheelchair}
								/>
							</RadioGroup>
							<FieldError errors={getFieldErrors(errors.bringingOwnWheelchair)} />
						</Field>
					)}
				/>
			)}

			{showWheelchairType && (
				<>
					{/* Electric or manual */}
					<Controller
						name="wheelchairType"
						control={control}
						render={({ field }) => (
							<Field>
								<FieldHeader>
									<FieldLabel id="wheelchair-type-label">
										{t("question_wheelchair_type")}
									</FieldLabel>
									<Badge variant="destructive">{t("badge_required")}</Badge>
								</FieldHeader>
								<RadioGroup
									className="grid grid-cols-2 gap-2 md:grid-cols-4"
									value={field.value}
									onValueChange={field.onChange}
									aria-labelledby="wheelchair-type-label"
								>
									<RadioGroupBorderedItem
										value="electric"
										label={t("label_electric")}
										aria-invalid={!!errors.wheelchairType}
									/>
									<RadioGroupBorderedItem
										value="manual"
										label={t("label_manual")}
										aria-invalid={!!errors.wheelchairType}
									/>
								</RadioGroup>
								<FieldError errors={getFieldErrors(errors.wheelchairType)} />
							</Field>
						)}
					/>

					{showBatteryQuestion && (
						<Controller
							name="wheelchairBatteryRemovable"
							control={control}
							render={({ field }) => (
								<Field>
									<FieldHeader>
										<FieldLabel id="battery-removable-label">
											{t("question_battery_removable")}
										</FieldLabel>
										<Badge variant="destructive">{t("badge_required")}</Badge>
									</FieldHeader>
									<RadioGroup
										value={field.value}
										onValueChange={field.onChange}
										className="grid grid-cols-2 gap-2 md:grid-cols-4"
										aria-labelledby="battery-removable-label"
									>
										<RadioGroupBorderedItem
											value="yes"
											label={t("label_yes")}
											aria-invalid={!!errors.wheelchairBatteryRemovable}
										/>
										<RadioGroupBorderedItem
											value="no"
											label={t("label_no")}
											aria-invalid={!!errors.wheelchairBatteryRemovable}
										/>
									</RadioGroup>
									<FieldError errors={getFieldErrors(errors.wheelchairBatteryRemovable)} />
								</Field>
							)}
						/>
					)}

					{/* Battery type — only for electric */}
					{showBatteryQuestion && !!batteryRemovable && wheelchairType === "electric" && (
						<Controller
							name="wheelchairBatteryType"
							control={control}
							render={({ field }) => (
								<Field>
									<FieldHeader>
										<FieldLabel id="battery-type-label">{t("question_battery_type")}</FieldLabel>
										<Badge variant="destructive">{t("badge_required")}</Badge>
									</FieldHeader>
									<RadioGroup
										className="grid grid-cols-1 gap-2 md:grid-cols-2"
										value={field.value}
										onValueChange={field.onChange}
										aria-labelledby="battery-type-label"
									>
										{BATTERY_TYPES.map((battery) => (
											<RadioGroupBorderedItem
												key={battery.value}
												value={battery.value}
												label={t(battery.label)}
												aria-invalid={!!errors.wheelchairBatteryType}
											/>
										))}
									</RadioGroup>
									<FieldError errors={getFieldErrors(errors.wheelchairBatteryType)} />
								</Field>
							)}
						/>
					)}

					{/* Foldable — only for manual */}
					{showFoldable && (
						<Controller
							name="isFoldable"
							control={control}
							render={({ field }) => (
								<Field>
									<FieldHeader>
										<FieldLabel id="is-foldable-label">
											{t("question_wheelchair_foldable")}
										</FieldLabel>
										<Badge variant="destructive">{t("badge_required")}</Badge>
									</FieldHeader>
									<RadioGroup
										value={field.value}
										onValueChange={field.onChange}
										className="grid grid-cols-2 gap-2 md:grid-cols-4"
										aria-labelledby="is-foldable-label"
									>
										<RadioGroupBorderedItem
											value="yes"
											label="Yes"
											aria-invalid={!!errors.isFoldable}
										/>
										<RadioGroupBorderedItem
											value="no"
											label="No"
											aria-invalid={!!errors.isFoldable}
										/>
									</RadioGroup>
									<FieldError errors={getFieldErrors(errors.isFoldable)} />
								</Field>
							)}
						/>
					)}

					{/* Dimensions */}
					{showDimensions && (
						<div className="wheelchair-dimensions flex flex-col gap-4">
							<span className="font-medium text-base-900 text-sm leading-6">
								{t("wheelchair_dimensions_title")}
							</span>

							<div className="grid grid-cols-2 gap-4">
								<FieldDimensionInput
									id="wheelchair-height"
									label={t("label_height")}
									title={t("title_numeric_characters_only")}
									required
									unit="cm"
									min={1}
									max={999}
									defaultValue={0}
									placeholder="0"
									errors={getFieldErrors(errors.wheelchairHeight)}
									aria-invalid={!!errors.wheelchairHeight}
									{...wheelchairHeightReg}
									onBlur={() => trigger("wheelchairHeight")}
									onChange={(e) => {
										wheelchairHeightReg.onChange(e);
										handleFieldOnChange(
											"wheelchairHeight",
											e.target.value,
											setValue,
											!!errors.wheelchairHeight
										);
									}}
								/>

								<FieldDimensionInput
									id="wheelchair-width"
									label={t("label_width")}
									title={t("title_numeric_characters_only")}
									required
									unit="cm"
									min={1}
									max={999}
									defaultValue={0}
									placeholder="0"
									errors={getFieldErrors(errors.wheelchairWidth)}
									aria-invalid={!!errors.wheelchairWidth}
									{...wheelchairWidthReg}
									onBlur={() => trigger("wheelchairWidth")}
									onChange={(e) => {
										wheelchairWidthReg.onChange(e);
										handleFieldOnChange(
											"wheelchairWidth",
											e.target.value,
											setValue,
											!!errors.wheelchairWidth
										);
									}}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<FieldDimensionInput
									id="wheelchair-depth"
									label={t("label_depth")}
									title={t("title_numeric_characters_only")}
									required
									unit="cm"
									min={1}
									max={999}
									defaultValue={0}
									placeholder="0"
									errors={getFieldErrors(errors.wheelchairDepth)}
									aria-invalid={!!errors.wheelchairDepth}
									{...wheelchairDepthReg}
									onBlur={() => trigger("wheelchairDepth")}
									onChange={(e) => {
										wheelchairDepthReg.onChange(e);
										handleFieldOnChange(
											"wheelchairDepth",
											e.target.value,
											setValue,
											!!errors.wheelchairDepth
										);
									}}
								/>

								<FieldDimensionInput
									id="wheelchair-weight"
									label={t("label_weight")}
									title={t("title_numeric_characters_only")}
									required
									unit="kg"
									min={1}
									max={999}
									defaultValue={0}
									placeholder="0"
									errors={getFieldErrors(errors.wheelchairWeight)}
									aria-invalid={!!errors.wheelchairWeight}
									{...wheelchairWeightReg}
									onBlur={() => trigger("wheelchairWeight")}
									onChange={(e) => {
										wheelchairWeightReg.onChange(e);
										handleFieldOnChange(
											"wheelchairWeight",
											e.target.value,
											setValue,
											!!errors.wheelchairWeight
										);
									}}
								/>
							</div>
						</div>
					)}
				</>
			)}
		</>
	);
}
