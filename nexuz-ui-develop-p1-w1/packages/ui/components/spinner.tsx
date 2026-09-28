import type * as React from "react";
import { cn } from "../lib/utils";

// ─── Size tokens ──────────────────────────────────────────────────────────────

type SpinnerSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<SpinnerSize, { px: number; stroke: number }> = {
	sm: { px: 24, stroke: 3 },
	md: { px: 36, stroke: 3.5 },
	lg: { px: 48, stroke: 4 },
	xl: { px: 64, stroke: 5 },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

interface SpinnerProps extends React.ComponentProps<"svg"> {
	/**
	 * Controls the diameter of the spinner.
	 * @default "lg"
	 */
	size?: SpinnerSize;
}

function Spinner({ size = "lg", className, ...props }: SpinnerProps) {
	const { px, stroke } = sizeMap[size];
	const center = px / 2;
	const radius = center - stroke * 2;
	const circumference = 2 * Math.PI * radius;

	// Arc covers ~25% of the circle — matches the Figma VD
	const arcLength = circumference * 0.25;
	const gapLength = circumference - arcLength;

	return (
		<svg
			role="status"
			aria-label="Loading"
			width={px}
			height={px}
			viewBox={`0 0 ${px} ${px}`}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("animate-spin", className)}
			{...props}
		>
			{/* Track ring — light gray */}
			<circle
				cx={center}
				cy={center}
				r={radius}
				stroke="var(--color-base-150)"
				strokeWidth={stroke}
				strokeLinecap="round"
			/>
			{/* Progress arc — Primary-600 (#008568) */}
			<circle
				cx={center}
				cy={center}
				r={radius}
				stroke="var(--color-green-600)"
				strokeWidth={stroke}
				strokeLinecap="round"
				strokeDasharray={`${arcLength} ${gapLength}`}
				// Start arc from the top (12 o'clock)
				strokeDashoffset={circumference * 0.25}
				transform={`rotate(-90 ${center} ${center})`}
			/>
		</svg>
	);
}

export type { SpinnerProps, SpinnerSize };
export { Spinner };
