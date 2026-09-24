"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import Icon from "./icon";

export type StepStatus = "completed" | "active" | "upcoming";

export interface StepItem {
	id: string | number;
	label: string;
	description?: string;
	icon?: string; // Material Symbol name — shown as descriptive icon on mobile
}

export interface StepperProps {
	steps: StepItem[];
	currentStep: number; // 0-indexed
	className?: string;
	completedSteps?: number[]; // 0-indexed array of completed step indices (for tracking visited steps during backward navigation)
}

function getStepStatus(index: number, currentStep: number, completedSteps?: number[]): StepStatus {
	if (index < currentStep) return "completed";
	if (index === currentStep) return "active";
	if (completedSteps?.includes(index)) return "completed";
	return "upcoming";
}

// ─── Status icon mapping ──────────────────────────────────────────────────────

const statusIconName: Record<StepStatus, string> = {
	completed: "check_circle",
	active: "radio_button_checked",
	upcoming: "radio_button_checked",
};

const statusIconFill: Record<StepStatus, 0 | 1> = {
	completed: 1,
	active: 0,
	upcoming: 0,
};

const statusIconColor: Record<StepStatus, string> = {
	completed: "text-primary-700",
	active: "text-primary-700",
	upcoming: "text-base-300",
};

const descriptiveIconColor: Record<StepStatus, string> = {
	completed: "text-primary-700",
	active: "text-primary-700",
	upcoming: "text-base-300",
};

const descriptiveIconFill: Record<StepStatus, 0 | 1> = {
	completed: 1,
	active: 1,
	upcoming: 1,
};

// ─── Connector helpers ────────────────────────────────────────────────────────

/**
 * Desktop: connector between step[i] and step[i+1] is green only when step[i] is COMPLETED.
 * Active step's right connector is gray (right of active = gray).
 * Mobile: active step has BOTH connectors green (right connector is green when i <= currentStep).
 */
function getConnectorGreen(
	index: number,
	currentStep: number,
	side: "left" | "right",
	isDesktop: boolean,
	completedSteps?: number[],
): boolean {
	const isCompleted = index < currentStep || (completedSteps?.includes(index) ?? false);

	if (side === "left") {
		// left connector: green when step[i-1] is completed
		return index - 1 < currentStep || (completedSteps?.includes(index - 1) ?? false);
	}
	// right connector
	if (isDesktop) {
		// desktop: green only when step[i] is completed
		return isCompleted;
	} else {
		// mobile: green when step[i] is completed OR active
		return isCompleted || index === currentStep;
	}
}

function ConnectorHalf({ isGreen, visible }: { isGreen: boolean; visible: boolean }) {
	return (
		<div
			className={cn(
				"flex-1 h-px transition-colors duration-200",
				!visible ? "invisible" : isGreen ? "bg-primary-700" : "bg-base-300",
			)}
			aria-hidden="true"
		/>
	);
}

// ─── Unified Step Item ────────────────────────────────────────────────────────

function StepItem({
	step,
	index,
	total,
	currentStep,
	completedSteps,
}: {
	step: StepItem;
	index: number;
	total: number;
	currentStep: number;
	completedSteps?: number[];
}) {
	const status = getStepStatus(index, currentStep, completedSteps);
	const isFirst = index === 0;
	const isLast = index === total - 1;

	return (
		<li
			className="flex flex-1 list-none flex-col items-center gap-1"
			aria-current={status === "active" ? "step" : undefined}
		>
			{/* Icon track: left-half | status icon | right-half */}
			<div className="flex w-full items-center gap-2">
				<ConnectorHalf
					visible={!isFirst}
					isGreen={getConnectorGreen(index, currentStep, "left", true, completedSteps)}
				/>
				<Icon
					name={statusIconName[status]}
					size={16}
					color={statusIconColor[status]}
					fill={statusIconFill[status]}
				/>
				<ConnectorHalf
					visible={!isLast}
					isGreen={getConnectorGreen(index, currentStep, "right", true, completedSteps)}
				/>
			</div>

			{/* Desktop: text label (hidden on mobile) */}
			<div className="hidden w-full justify-center px-1 md:flex md:max-w-20">
				<span className="whitespace-pre-line text-center text-sm font-bold leading-6 text-base-700">
					{step.label}
				</span>
			</div>

			{/* Mobile: descriptive icon (hidden on desktop) */}
			{step.icon && (
				<div className="flex md:hidden">
					<Icon
						name={step.icon}
						size={24}
						color={descriptiveIconColor[status]}
						fill={descriptiveIconFill[status]}
					/>
				</div>
			)}
		</li>
	);
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(
	({ steps, currentStep, className, completedSteps }, ref) => {
		return (
			<ol ref={ref} className={cn("flex w-full", className)} aria-label="Progress steps">
				{steps.map((step, index) => (
					<StepItem
						key={step.id}
						step={step}
						index={index}
						total={steps.length}
						currentStep={currentStep}
						completedSteps={completedSteps}
					/>
				))}
			</ol>
		);
	},
);

Stepper.displayName = "Stepper";

export { Stepper };
