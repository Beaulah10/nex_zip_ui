"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { Button } from "@repo/ui/components/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@repo/ui/components/input-group";
import { XIcon } from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import Icon from "./icon";

const Combobox = ComboboxPrimitive.Root;

/**
 * Resolves the dialog content element used as the portal container.
 * Keeps combobox popup interactions scoped correctly when rendered inside dialogs.
 */
function resolveDialogPortalContainer(
	anchor: ComboboxPrimitive.Positioner.Props["anchor"],
): HTMLElement | null {
	let anchorElement: Element | null = null;

	if (anchor instanceof Element) {
		anchorElement = anchor;
	} else if (typeof anchor === "function") {
		const resolved = anchor();
		anchorElement = resolved instanceof Element ? resolved : null;
	} else if (anchor && "current" in anchor) {
		anchorElement = anchor.current;
	}

	const fromAnchor = anchorElement?.closest("[data-slot='dialog-content']");
	if (fromAnchor instanceof HTMLElement) {
		return fromAnchor;
	}

	if (typeof document === "undefined") {
		return null;
	}

	const fromActive = document.activeElement?.closest("[data-slot='dialog-content']");
	return fromActive instanceof HTMLElement ? fromActive : null;
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
	return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />;
}

function ComboboxTrigger({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) {
	return (
		<ComboboxPrimitive.Trigger
			data-slot="combobox-trigger"
			className={cn("flex cursor-pointer items-center", className)}
			{...props}
		>
			{children}
			<Icon name="arrow_drop_down" size={20} color="text-primary-600" />
		</ComboboxPrimitive.Trigger>
	);
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
	return (
		<ComboboxPrimitive.Clear
			data-slot="combobox-clear"
			tabIndex={0}
			render={<InputGroupButton variant="ghost" size="icon-xs" />}
			className={cn("size-5 cursor-pointer", className)}
			{...props}
		>
			<XIcon className="pointer-events-none" />
		</ComboboxPrimitive.Clear>
	);
}

function ComboboxInput({
	className,
	children,
	disabled = false,
	showTrigger = true,
	showClear = false,
	placeholder,
	...props
}: ComboboxPrimitive.Input.Props & {
	showTrigger?: boolean;
	showClear?: boolean;
}) {
	return (
		<InputGroup
			className={cn(
				"h-11 min-h-10 w-auto cursor-pointer gap-2 border-base-300 bg-white px-3 py-1 !focus-within:border-base-300 !focus-within:ring-0",
				className,
			)}
		>
			{/* Visible layer: shows selected value; typed search text is kept invisible below */}
			{/* Overlay shows the selected label; native input handles placeholder when empty */}
			<span
				aria-hidden="true"
				data-slot="combobox-selected-value"
				className="pointer-events-none absolute inset-y-0 left-3 right-10 flex items-center overflow-hidden text-ellipsis whitespace-nowrap text-base font-medium text-base-900"
			>
				<ComboboxValue />
			</span>
			<ComboboxPrimitive.Input
				render={
					<InputGroupInput
						disabled={disabled}
						className="cursor-pointer px-0 text-transparent caret-transparent selection:bg-transparent selection:text-transparent placeholder:text-gray-600 focus-visible:border-0 focus-visible:ring-0 aria-invalid:focus-visible:border-0 aria-invalid:focus-visible:ring-0"
					/>
				}
				placeholder={placeholder}
				{...props}
			/>
			<InputGroupAddon align="inline-end" className="!cursor-pointer py-0 pr-0">
				{showTrigger && (
					<InputGroupButton
						size="icon-xs"
						variant="ghost"
						asChild
						data-slot="input-group-button"
						className="group-has-data-[slot=combobox-clear]/input-group:hidden cursor-pointer data-pressed:bg-transparent"
						disabled={disabled}
						aria-label="Open dropdown"
					>
						<ComboboxTrigger />
					</InputGroupButton>
				)}
				{showClear && <ComboboxClear disabled={disabled} />}
			</InputGroupAddon>
			{children}
		</InputGroup>
	);
}

function ComboboxContent({
	className,
	side = "bottom",
	sideOffset = 6,
	align = "start",
	alignOffset = 0,
	anchor,
	...props
}: ComboboxPrimitive.Popup.Props &
	Pick<
		ComboboxPrimitive.Positioner.Props,
		"side" | "align" | "sideOffset" | "alignOffset" | "anchor"
	>) {
	const portalContainer = resolveDialogPortalContainer(anchor);

	return (
		<ComboboxPrimitive.Portal container={portalContainer}>
			<ComboboxPrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				positionMethod="fixed"
				anchor={anchor}
				className="isolate z-40"
			>
				<ComboboxPrimitive.Popup
					data-slot="combobox-content"
					data-chips={!!anchor}
					className={cn(
						"group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-white text-base-900 shadow-md duration-100 data-[chips=true]:min-w-(--anchor-width) data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:border-input/30 *:data-[slot=input-group]:bg-input/30 *:data-[slot=input-group]:shadow-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 pointer-events-auto",
						className,
					)}
					{...props}
				/>
			</ComboboxPrimitive.Positioner>
		</ComboboxPrimitive.Portal>
	);
}

function ComboboxList({
	className,
	initialScrollPosition = "start",
	...props
}: ComboboxPrimitive.List.Props & {
	initialScrollPosition?: "start" | "end";
}) {
	const listRef = React.useRef<HTMLDivElement | null>(null);

	React.useLayoutEffect(() => {
		if (initialScrollPosition !== "end") {
			return;
		}

		const listElement = listRef.current;
		if (!listElement) {
			return;
		}

		const frameId = requestAnimationFrame(() => {
			listElement.scrollTop = listElement.scrollHeight;
		});

		return () => cancelAnimationFrame(frameId);
	}, [initialScrollPosition]);

	return (
		<ComboboxPrimitive.List
			ref={listRef}
			data-slot="combobox-list"
			className={cn(
				"max-h-64 overflow-y-auto overscroll-contain py-1 divide-y divide-gray-100 data-empty:py-0 pointer-events-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
				className,
			)}
			{...props}
		/>
	);
}

function ComboboxItem({ className, children, ...props }: ComboboxPrimitive.Item.Props) {
	return (
		<ComboboxPrimitive.Item
			data-slot="combobox-item"
			className={cn(
				"relative flex w-full cursor-pointer select-none items-center gap-3 px-4 py-2 text-sm font-medium leading-6 text-base-900 outline-hidden transition-colors pointer-events-auto",
				"first:rounded-t-lg last:rounded-b-lg",
				"data-highlighted:bg-gray-100",
				"aria-selected:text-primary-700",
				"data-disabled:pointer-events-none data-disabled:opacity-50",
				className,
			)}
			{...props}
		>
			<span className="flex-1">{children}</span>
			<ComboboxPrimitive.ItemIndicator
				render={<span className="pointer-events-none flex shrink-0 items-center justify-center" />}
			>
				<Icon name="check_circle" size={24} fill={1} color="text-primary-700" />
			</ComboboxPrimitive.ItemIndicator>
		</ComboboxPrimitive.Item>
	);
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
	return (
		<ComboboxPrimitive.Group data-slot="combobox-group" className={cn(className)} {...props} />
	);
}

function ComboboxLabel({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) {
	return (
		<ComboboxPrimitive.GroupLabel
			data-slot="combobox-label"
			className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
			{...props}
		/>
	);
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
	return <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />;
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
	return (
		<ComboboxPrimitive.Empty
			data-slot="combobox-empty"
			className={cn(
				"hidden w-full justify-center py-2 text-center text-sm text-muted-foreground group-data-empty/combobox-content:flex",
				className,
			)}
			{...props}
		/>
	);
}

function ComboboxSeparator({ className, ...props }: ComboboxPrimitive.Separator.Props) {
	return (
		<ComboboxPrimitive.Separator
			data-slot="combobox-separator"
			className={cn("-mx-1 my-1 h-px bg-border", className)}
			{...props}
		/>
	);
}

function ComboboxChips({
	className,
	...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) {
	return (
		<ComboboxPrimitive.Chips
			data-slot="combobox-chips"
			className={cn(
				"flex min-h-8 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent bg-clip-padding px-2.5 py-1 text-sm transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-3 has-aria-invalid:ring-destructive/20 has-data-[slot=combobox-chip]:px-1 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40",
				className,
			)}
			{...props}
		/>
	);
}

function ComboboxChip({
	className,
	children,
	showRemove = true,
	...props
}: ComboboxPrimitive.Chip.Props & {
	showRemove?: boolean;
}) {
	return (
		<ComboboxPrimitive.Chip
			data-slot="combobox-chip"
			className={cn(
				"flex h-[calc(--spacing(5.25))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
				className,
			)}
			{...props}
		>
			{children}
			{showRemove && (
				<ComboboxPrimitive.ChipRemove
					render={<Button variant="ghost" size="icon-xs" />}
					className="-ml-1 opacity-50 hover:opacity-100"
					data-slot="combobox-chip-remove"
				>
					<XIcon className="pointer-events-none" />
				</ComboboxPrimitive.ChipRemove>
			)}
		</ComboboxPrimitive.Chip>
	);
}

function ComboboxChipsInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
	return (
		<ComboboxPrimitive.Input
			data-slot="combobox-chip-input"
			className={cn("min-w-16 flex-1 outline-none", className)}
			{...props}
		/>
	);
}

function useComboboxAnchor() {
	return React.useRef<HTMLDivElement | null>(null);
}

export {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxClear,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
	ComboboxSeparator,
	ComboboxTrigger,
	ComboboxValue,
	useComboboxAnchor,
};
