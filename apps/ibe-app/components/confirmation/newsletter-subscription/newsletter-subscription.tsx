/**
 * File: newsletter-subscription.tsx
 * Description: Newsletter subscription component that allows users to opt in or out
 * of receiving promotional and travel-related communications during booking confirmation.
 * Manages subscription preference state and notifies parent components of changes.
 */
"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import { cn } from "@repo/ui/lib";
import { useEffect, useId, useState } from "react";
import type { NewsletterSubscriptionProps } from "@/types/confirmation/confirmation.types";

/** Optional newsletter opt-in checkbox shown at the end of the confirmation page. */
export function NewsletterSubscription({
	label,
	caption,
	defaultChecked = false,
	onCheckedChange,
	className,
}: NewsletterSubscriptionProps) {
	const id = useId();
	const [checked, setChecked] = useState(defaultChecked);

	useEffect(() => {
		setChecked(defaultChecked);
	}, [defaultChecked]);

	return (
		<div
			className={cn("newsletter-subscription flex w-full flex-col gap-2 md:w-[504px]", className)}
		>
			<label htmlFor={id} className="flex cursor-pointer items-center gap-2 py-2">
				<Checkbox
					id={id}
					aria-labelledby={`${id}-label`}
					checked={checked}
					onCheckedChange={(value) => {
						const next = value === true;
						setChecked(next);
						onCheckedChange?.(next);
					}}
				/>
				<span id={`${id}-label`} className="font-normal text-base text-base-900 leading-6">
					{label}
				</span>
			</label>
			<p className="font-normal text-base-700 text-sm leading-6">{caption}</p>
		</div>
	);
}
