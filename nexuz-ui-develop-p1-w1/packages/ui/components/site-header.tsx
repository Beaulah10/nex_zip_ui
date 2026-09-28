"use client";

import { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import Icon from "./icon";

const NAV_ITEMS = [
	{ label: "Flight Booking", href: "#" },
	{ label: "Booking Confirmation & Changes", href: "#" },
	{ label: "Boarding", href: "#" },
	{ label: "Support", href: "#" },
];

function ZipairLogo() {
	return (
		<svg
			width="120"
			height="29"
			viewBox="0 0 120 29"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-label="ZIPAIR"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M99.1613 10.9197H99.2131C103.794 10.9197 107.958 10.735 107.958 5.78C107.958 0.82522 103.04 0.979175 99.2131 1.17744L99.161 10.9197H99.1613ZM120 22.5272V23.5002L113.706 23.4534C106.695 20.4916 108.87 13.5132 101.417 12.2919C100.378 12.1211 99.218 12.1422 99.218 12.1422C99.218 12.1422 99.2185 13.7386 99.2185 16.8831C99.2185 21.4617 99.6568 22.4344 103.313 22.4344V23.4071H91.9082V22.4344C95.6295 22.4344 95.5438 21.1983 95.5438 16.8182C95.5438 9.67987 95.5396 8.00468 95.5396 5.41764C95.5396 2.05018 95.5264 1.27793 92.095 1.27793V0.320039C97.8477 0.0960364 103.545 -0.274248 107.263 0.56508C110.714 1.34302 112.329 3.9714 112.329 5.98322C112.329 8.33165 111.28 10.9524 105.172 11.7372C110.161 12.3699 112.943 18.2984 115.575 20.6864C117.226 22.1839 118.649 22.5272 120 22.5272ZM69.1788 13.0659C69.1788 13.0659 68.7207 12.1506 68.1298 10.9224C67.5394 9.69349 64.9823 4.3756 64.9823 4.3756C64.9823 4.3756 62.4237 9.69175 61.8353 10.9217C61.4922 11.6388 61.1442 12.3535 60.7915 13.0659H69.1788ZM79.3022 0.319791H89.6987V1.29773C86.8135 1.29773 86.3492 1.32199 86.3492 6.00104C86.3492 10.9962 86.3348 14.6567 86.3348 17.9991C86.3348 21.7421 86.5554 22.4364 89.6987 22.4364L89.7011 23.4094H70.1443V22.4366C73.0528 22.4366 72.913 20.9473 72.5719 20.1768C72.3739 19.7293 71.3611 17.6316 70.7226 16.2908C70.4044 15.6242 70.0879 14.9567 69.7732 14.2884H60.204C60.204 14.2884 59.842 15.076 59.1989 16.416C58.5549 17.7558 58.0882 18.7278 57.7346 19.5639C56.9366 21.4527 58.0978 22.4364 61.0642 22.4364V23.4094H52.0919V22.4366C54.9364 22.4366 55.3049 21.4498 56.4383 19.1684C57.3345 17.3658 65.6468 0 65.6468 0H66.8368C66.8368 0 75.3896 17.7472 76.2982 19.5941C77.2074 21.4416 77.7894 22.4549 79.5148 22.4549C81.2722 22.4549 82.6598 22.4582 82.6598 17.9801C82.6598 13.9802 82.6621 8.46853 82.6621 6.02109C82.6621 1.67717 82.398 1.27941 79.3022 1.27941V0.319791ZM43.7804 10.9123C48.349 11.0033 52.2517 10.7813 52.2517 6.00425C52.2517 1.22743 47.3885 0.965562 43.7804 1.25045V10.9123ZM36.6202 0.319791C47.1868 -0.140094 50.4887 -0.00495032 53.184 1.26728C55.8797 2.53977 56.2146 4.93177 56.2146 6.16464C56.2146 7.39851 55.5704 9.7618 53.7085 10.8041C52.1204 11.6919 50.3197 12.2179 43.7804 12.0966C43.7804 12.0966 43.7858 16.0896 43.7858 18.3184C43.7858 21.9611 43.9984 22.4371 47.4303 22.4371V23.4094H36.6172V22.4369C39.9302 22.4369 40.1039 21.9319 40.1039 18.0199L40.1034 5.44016C40.1034 1.46777 40.1636 1.2809 36.6199 1.2809L36.6202 0.319791Z"
				fill="var(--color-gray-905)"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M52.6016 28.08H119.554V25.7175H52.6016V28.08Z"
				fill="var(--color-primary-550)"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M34.3834 23.4101H23.986V22.4366C27.0827 22.4366 27.3476 22.0285 27.3476 17.5705V6.10129C27.3476 1.64277 27.0626 1.27967 23.9862 1.27967V0.31955H34.3846V1.27967C31.2505 1.27967 31.0231 1.64302 31.0231 6.10153V17.5707C31.0231 22.0287 31.3298 22.4354 34.3849 22.4354V23.4101H34.3834ZM0.704377 6.18371H2.10124C4.07959 2.45042 6.07578 1.48312 7.39459 1.48312H16.6754L0 22.321L0.485854 23.4099H19.8598L22.8532 16.6947H21.4383C19.2332 20.8654 17.212 21.9753 15.6353 21.9753L5.40163 21.975L21.7569 1.40342L21.2757 0.325737H3.31451L0.704377 6.18371Z"
				fill="#272726"
			/>
		</svg>
	);
}

type SiteHeaderProps = {
	className?: string;
	showBackArrow?: boolean;
	onBackClick?: () => void;
};

export function SiteHeader(props: Readonly<SiteHeaderProps>) {
	const { className, showBackArrow = false, onBackClick } = props;
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className={cn("w-full bg-white fixed z-11", className)}>
			{/* Navbar outer: px-20 matches Figma padding 0 80px */}
			<div className="px-4 md:px-20">
				{/* Body: py-2 px-4 matches Figma padding 8px 16px, min-h-[72px] */}
				<div
					className={`flex min-h-[72px] items-center py-2 md:justify-between ${showBackArrow ? "" : "justify-between"}`}
				>
					<div
						className={`md:hidden ${showBackArrow ? "flex items-center justify-center" : "hidden"}`}
					>
						{showBackArrow && (
							<button
								type="button"
								aria-label="arrow_back"
								className="flex cursor-pointer items-center justify-center"
								onClick={onBackClick}
							>
								<Icon
									name="arrow_back"
									size={24}
									fill={1}
									wght={400}
									grad={0}
									opsz={20}
									color="text-base-900"
								/>
							</button>
						)}
					</div>

					{/* Order1: Logo + nav items */}
					<div
						className={`flex items-center gap-4 md:flex-none md:justify-start ${showBackArrow ? "flex-1 justify-center" : "justify-start"}`}
					>
						<a href="/" aria-label="ZIPAIR Home" className="flex justify-center">
							<ZipairLogo />
						</a>

						{/* Desktop navigation */}
						{/* <nav
							className="hidden items-start gap-4 py-4 xl:flex"
							aria-label="Main navigation"
						>
							{NAV_ITEMS.map((item) => (
								<a
									key={item.label}
									href={item.href}
									className="flex items-center gap-2 rounded text-sm font-medium leading-6 text-base-900 transition-colors hover:text-primary-700"
								>
									{item.label}
									<Icon
										name="expand_more"
										size={16}
										color="text-primary-600"
										className="shrink-0"
									/>
								</a>
							))}
						</nav> */}
					</div>

					{/* Order2: Right-side controls */}
					<div className="hidden items-center gap-3 xl:flex">
						{/* Currency selector */}
						{/* <button
							type="button"
							className="flex items-center gap-1 text-xs font-medium text-base-900 transition-colors hover:text-primary-700"
						>
							JPY (¥)
							<Icon name="expand_more" size={16} color="text-primary-600" className="shrink-0" />
						</button> */}

						{/* Language selector */}
						{/* <button
							type="button"
							className="flex items-center gap-1 text-xs font-medium text-base-900 transition-colors hover:text-primary-700"
						>
							Japanese
							<Icon name="expand_more" size={16} color="text-primary-600" className="shrink-0" />
						</button> */}

						{/* Search */}
						{/* <button type="button" aria-label="Search" className="flex items-center">
							<Icon name="search" size={24} color="text-primary-600" />
						</button> */}

						{/* Vertical separator */}
						{/* <div className="h-6 w-px bg-base-300" role="separator" aria-hidden="true" /> */}

						{/* ZIPAIR Point Club */}
						{/* <a
							href="#"
							className="text-xs font-medium text-base-900 transition-colors hover:text-primary-700"
						>
							ZIPAIR Point Club
						</a> */}

						{/* Login button */}
						{/* <Button variant="primary" outline size="sm">
							Login
						</Button> */}
					</div>

					{/* Mobile menu toggle */}
					<button
						type="button"
						className="flex h-9 w-9 items-center justify-center md:hidden"
						aria-label={mobileOpen ? "Close menu" : "Open menu"}
						aria-expanded={mobileOpen}
						onClick={() => setMobileOpen((v) => !v)}
					>
						<div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-700">
							<Icon
								variant="rounded"
								name={mobileOpen ? "close" : "menu"}
								size={24}
								color="text-primary-700"
							/>
						</div>
					</button>
				</div>
			</div>

			{/* Mobile menu drawer */}
			{mobileOpen && (
				<div className="border-t border-base-300 bg-white px-8 py-4 xl:hidden">
					<nav className="flex flex-col gap-1" aria-label="Mobile navigation">
						{NAV_ITEMS.map((item) => (
							<a
								key={item.label}
								href={item.href}
								className="flex items-center justify-between rounded py-3 text-sm font-medium text-base-900 transition-colors hover:text-primary-700"
								onClick={() => setMobileOpen(false)}
							>
								{item.label}
								<Icon name="expand_more" size={16} color="text-primary-600" />
							</a>
						))}
					</nav>

					<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-base-300 pt-4">
						<button
							type="button"
							className="flex items-center gap-1 text-xs font-medium text-base-900"
						>
							JPY (¥)
							<Icon name="expand_more" size={16} color="text-primary-600" />
						</button>
						<button
							type="button"
							className="flex items-center gap-1 text-xs font-medium text-base-900"
						>
							Japanese
							<Icon name="expand_more" size={16} color="text-primary-600" />
						</button>
						<button type="button" aria-label="Search" className="flex items-center">
							<Icon name="search" size={24} color="text-primary-600" />
						</button>
					</div>

					<div className="mt-3 flex items-center justify-between">
						{/** biome-ignore lint/a11y/useValidAnchor: <shadcn> */}
						<a href="#" className="text-xs font-medium text-base-900 hover:text-primary-700">
							ZIPAIR Point Club
						</a>
						<Button variant="primary" outline size="sm">
							Login
						</Button>
					</div>
				</div>
			)}
		</header>
	);
}
