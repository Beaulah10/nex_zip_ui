"use client";

import Icon from "@repo/ui/components/icon";
import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "../lib/utils";

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

type DialogDesktopWidth = 576 | 640 | 1024;
type MobileOuterSpacing = 0 | 16;

const dialogDesktopWidthClasses: Record<DialogDesktopWidth, string> = {
	576: "md:max-w-[576px]",
	640: "md:max-w-[640px]",
	1024: "md:max-w-[1024px]",
};

const dialogMobileOuterSpacingClasses: Record<MobileOuterSpacing, string> = {
	0: "w-full",
	16: "w-[calc(100%-32px)] md:w-full",
};

function DialogOverlay({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
	return (
		<DialogPrimitive.Overlay
			data-slot="dialog-overlay"
			className={cn(
				"fixed inset-0 isolate z-50 bg-black/50 duration-150",
				"data-open:animate-in data-open:fade-in-0",
				"data-closed:animate-out data-closed:fade-out-0",
				className,
			)}
			{...props}
		/>
	);
}

const dialogGapClasses: Record<NonNullable<DialogGap>, string> = {
	0: "gap-0",
	2: "gap-2",
	4: "gap-4",
	6: "gap-6",
	8: "gap-8",
};

type DialogGap = 0 | 2 | 4 | 6 | 8;

function DialogContent({
	className,
	children,
	desktopWidth = 640,
	mobileOuterSpacing = 16,
	gap = 4,
	// showCloseButton kept for API compatibility — close button is now owned by DialogHeader
	showCloseButton: _showCloseButton,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
	showCloseButton?: boolean;
	desktopWidth?: DialogDesktopWidth;
	mobileOuterSpacing?: MobileOuterSpacing;
	gap?: DialogGap;
}) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Content
				data-slot="dialog-content"
				className={cn(
					"fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
					"grid rounded-[16px] bg-white shadow-xl",
					dialogGapClasses[gap],
					dialogMobileOuterSpacingClasses[mobileOuterSpacing],
					"text-sm text-gray-900 outline-none",
					dialogDesktopWidthClasses[desktopWidth],
					"duration-150",
					"data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
					"data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
					className,
				)}
				{...props}
			>
				{children}
			</DialogPrimitive.Content>
		</DialogPortal>
	);
}

// Figma: header is a flex-row with title (flex-1) + inline close button (48px circle)
// padding: 16px 24px, border-bottom: #C7D1D6, bg: white, border-radius: 16px 16px 0 0
function DialogHeader({
	className,
	children,
	showCloseButton = true,
	...props
}: React.ComponentProps<"div"> & { showCloseButton?: boolean }) {
	return (
		<div
			data-slot="dialog-header"
			className={cn(
				"relative z-50 flex flex-row items-center gap-2 px-4 py-4 border-b border-gray-300 bg-white rounded-t-2xl md:px-6 md:gap-4",
				className,
			)}
			{...props}
		>
			<div className="flex flex-1 flex-col gap-1">{children}</div>
			{showCloseButton && (
				<DialogPrimitive.Close
					data-slot="dialog-close"
					className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-brand-japan-black transition-colors hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
					aria-label="Close"
				>
					<Icon name="close" size={24} color="" className="text-current" />
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

function DialogFooter({ className, children, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				"flex flex-col-reverse gap-2 rounded-b-2xl border-t border-gray-300  px-4 py-4",
				"md:flex-row md:justify-end",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn(
				// Figma: 24px bold, #0D0D0F
				"text-2xl font-bold leading-9 text-brand-japan-black",
				className,
			)}
			{...props}
		/>
	);
}

function DialogDescription({
	className,
	...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				"text-sm text-gray-700 *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-gray-900",
				className,
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
