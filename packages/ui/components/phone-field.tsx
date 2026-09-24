"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import {
	Combobox,
	ComboboxContent,
	ComboboxItem,
	ComboboxList,
	useComboboxAnchor,
} from "./combobox";
import { Input } from "./input";

export interface PhoneExtension {
	/** Unique country identifier, e.g. "us" */
	code: string;
	/** Dial code for display, e.g. "+1" */
	dialCode: string;
	/** Human-readable country name shown in the picker */
	country?: string;
}

export interface PhoneFieldProps extends Omit<React.ComponentProps<"input">, "type" | "size"> {
	/** List of selectable country dial codes */
	extensions: PhoneExtension[];
	/** Currently active dial code */
	selectedExtension?: string;
	/** Called when the user picks a different dial code */
	onExtensionChange?: (code: string) => void;
	/** Forwarded to the text input */
	className?: string;
}

function PhoneField({
	extensions,
	selectedExtension,
	onExtensionChange,
	className,
	disabled = false,
	placeholder = "09012345678",
	...props
}: Readonly<PhoneFieldProps>) {
	const [open, setOpen] = React.useState(false);
	const anchorRef = useComboboxAnchor();
	const activeCode = selectedExtension ?? extensions[0]?.code ?? "";
	const activeDialCode = extensions.find((e) => e.code === activeCode)?.dialCode ?? "";
	return (
		<Combobox
			value={selectedExtension ?? ""}
			onValueChange={(code) => {
				if (code) {
					onExtensionChange?.(code);
					setOpen(false);
				}
			}}
			open={open && !disabled}
			onOpenChange={(newOpen) => !disabled && setOpen(newOpen)}
		>
			<div ref={anchorRef}>
				<div
					className={cn(
						"flex h-11 min-h-10 w-full items-center overflow-hidden",
						"rounded-lg border border-base-300 bg-white focus-within:border-2 focus-within:border-primary-600",
						disabled && "opacity-50",
						"has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:focus-within:border-2 has-[[data-slot][aria-invalid=true]]:focus-within:border-primary-600",
						className,
					)}
				>
					{/* ── Extension selector button ── */}
					<button
						type="button"
						disabled={disabled}
						onClick={() => !disabled && setOpen(!open)}
						aria-label={`Country code ${activeDialCode}. Click to change`}
						className={cn(
							"flex min-w-20 shrink-0 cursor-pointer items-center gap-2 self-stretch",
							"border-r border-base-300 bg-base-50 px-4 py-1",
							"transition-colors hover:bg-base-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600",
							disabled && "cursor-not-allowed opacity-50 hover:bg-base-50",
						)}
					>
						<span className="line-clamp-1 text-base leading-6 text-base-900 placeholder:text-base-600">
							{activeDialCode}
						</span>
						{/* Material Symbols icon — loaded via global.css */}
						<span
							className="material-symbols-outlined select-none text-2xl leading-none text-primary-700"
							aria-hidden="true"
						>
							arrow_drop_down
						</span>
					</button>

					{/* ── Phone number input ── */}
					<Input
						type="tel"
						inputMode="numeric"
						inputSize="md"
						disabled={disabled}
						placeholder={placeholder}
						className={cn(
							"min-w-0 flex-1 rounded-none border-0 bg-transparent px-4 py-1 text-base leading-6 text-base-900 shadow-none",
							"placeholder:text-base-600",
							"focus-visible:border-0",
							"aria-invalid:focus-visible:border-0",
						)}
						{...props}
					/>
				</div>
			</div>

			{/* ── Extension picker combobox dropdown ── */}
			<ComboboxContent anchor={anchorRef}>
				<ComboboxList>
					{extensions.map((item) => {
						const itemCode = item.code;
						const itemCountry = item.country;
						return (
							<ComboboxItem
								key={`${itemCode}-${itemCountry}`}
								value={itemCode}
								className={cn(activeCode === itemCode && "bg-primary-50")}
							>
								<div className="flex flex-1 items-center gap-3">
									<span className="min-w-10 text-base font-medium leading-6">
										{item.dialCode
											? `${item.dialCode} (${itemCountry})`
											: `${itemCode} (${itemCountry})`}
									</span>
								</div>
							</ComboboxItem>
						);
					})}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	);
}

export { PhoneField };
