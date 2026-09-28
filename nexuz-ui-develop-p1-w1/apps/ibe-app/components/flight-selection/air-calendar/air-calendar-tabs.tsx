"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/lib";
import type { AirCalendarTabsProps } from "@/types/flight-selection/flight-selection.types";

/**
 * Airline-style date/price calendar tab strip.
 *
 * Desktop (768px): 7 equal-width tabs, no scroll.
 * Mobile (<768px): 5 visible tabs with horizontal scroll-snap.
 */
export function AirCalendarTabs({
	tabs,
	value,
	defaultValue,
	onValueChange,
	children,
	className,
}: AirCalendarTabsProps) {
	return (
		<Tabs
			value={value}
			defaultValue={defaultValue ?? tabs[0]?.value}
			onValueChange={onValueChange}
			className={cn("w-full gap-0", className)}
		>
			<TabsList
				variant="line"
				className={cn(
					// Reset default styling - remove h-8 constraint from base tabs.tsx
					"h-16.5! w-full gap-2 rounded-none p-0 md:gap-1",
					// Grey border bottom for all tabs - 1px solid #E3E8EB
					"",
					// Flex layout
					"inline-flex items-center justify-center",
					// Horizontal scrolling with hidden scrollbar on mobile
					"overflow-x-auto overflow-y-hidden scroll-smooth",
					"[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
					// Scroll-snap container
					"[scroll-snap-type:x_mandatory]"
				)}
			>
				{tabs.map((tab) => (
					<TabsTrigger
						key={`${tab.value}-${tab.date}-${tab.price}`}
						value={tab.value}
						disabled={tab.disabled}
						aria-label={`${tab.date} ${tab.price}`}
						className={cn(
							// Base sizing
							"relative h-auto rounded-none border-0 px-4 py-2",
							// Min height for touch target
							"min-h-11",
							// Mobile: min 20% keeps 5 tabs visible (7×20% = 140% → scroll)
							// Desktop: flex-1 distributes equally (at ≥768px)
							"min-w-[5.3125rem] shrink-0 min-[768px]:min-w-0 min-[768px]:flex-1",
							// Scroll-snap alignment
							"[scroll-snap-align:start]",
							// Column layout: date over price
							"flex-col items-center justify-center gap-1",
							// Whitespace handling
							"whitespace-normal",
							// Cursor
							"cursor-pointer",
							// Inactive state: gray text (#494B4F), no bottom border
							"border-transparent border-b-2 text-secondary-700",
							// Hover state
							"hover:bg-transparent",
							// Remove default bg
							"bg-transparent",
							// Active state: teal text + 2px solid bottom border
							"data-[state=active]:-mb-[2px] data-[state=active]:border-b-primary-600 data-[state=active]:bg-transparent data-[state=active]:text-primary-700",
							// Smooth transition for border color
							"transition-colors",
							// Focus state
							"focus-visible:shadow-none! focus-visible:outline-2! focus-visible:outline-offset-[-2px] focus-visible:ring-0!"
						)}
					>
						<span className="font-bold text-current text-sm leading-6">{tab.date}</span>
						<span className="font-normal text-current text-xs leading-5">{tab.price}</span>
					</TabsTrigger>
				))}
			</TabsList>

			{tabs.map((tab) => (
				<TabsContent
					key={`${tab.value}-content`}
					value={tab.value}
					forceMount
					className="hidden"
					aria-hidden="true"
				/>
			))}

			{children}
		</Tabs>
	);
}

export { TabsContent as AirCalendarTabsContent } from "@repo/ui/components/tabs";
