import { cn } from "../lib/utils";
import Icon from "./icon";

const HELP_LINKS = [
	{ label: "Customer in need of assistance", href: "#" },
	{ label: "Contact us", href: "#" },
	{ label: "About various certificate", href: "#" },
];

const SOCIAL_LINKS = [
	{ label: "Instagram", href: "#" },
	{ label: "X (Twitter)", href: "#" },
	{ label: "note", href: "#" },
	{ label: "TikTok", href: "#" },
	{ label: "YouTube", href: "#" },
];

const CORPORATE_LINKS = [
	{ label: "Corporate site", href: "#" },
	{ label: "Recruitment information", href: "#" },
	{ label: "Advertising", href: "#" },
	{ label: "Sustainability", href: "#" },
];

const LEGAL_LINKS = [
	{ label: "Site Terms of Use", href: "#" },
	{ label: "Privacy Policy", href: "#" },
	{ label: "Security Policy", href: "#" },
	{ label: "International Passenger Transport Terms", href: "#" },
	{ label: "International Transport Terms (Canada version)", href: "#" },
	{ label: "Web Accessibility Policy", href: "#" },
];

type FooterLink = { label: string; href: string };

function FooterLinkGroup({
	title,
	links,
	external = false,
}: {
	title: string;
	links: FooterLink[];
	external?: boolean;
}) {
	return (
		<div className="flex flex-col gap-4">
			<div className="border-b border-white pb-1.5">
				<h3 className="text-sm font-bold leading-6 text-white">{title}</h3>
			</div>
			<ul className="flex flex-col gap-2">
				{links.map((link) => (
					<li key={link.label}>
						<a
							href={link.href}
							className="inline-flex items-center gap-1 text-sm leading-6 text-white underline underline-offset-2 hover:text-white/80"
							{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
						>
							{link.label}
							{external && (
								<Icon name="open_in_new" size={12} color="text-white" className="shrink-0" />
							)}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}

export function SiteFooter({ className }: { className?: string }) {
	return (
		<footer className={cn("w-full bg-brand-japan-black", className)}>
			<div className="mx-auto flex flex-col gap-12 px-4 py-12 md:px-20 md:py-14">
				{/* Three-column link groups */}
				<div className="w-full justify-between grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
					<FooterLinkGroup title="Help" links={HELP_LINKS} />
					<FooterLinkGroup title="Follow us" links={SOCIAL_LINKS} external />
					<FooterLinkGroup title="Corporate information" links={CORPORATE_LINKS} />
				</div>

				{/* Bottom legal section */}
				<div className="flex flex-col gap-12">
					{/* Legal links */}
					<div className="flex flex-wrap gap-x-3 gap-y-1">
						{LEGAL_LINKS.map((link) => (
							<a
								key={link.label}
								href={link.href}
								className="text-xs leading-5 text-white underline underline-offset-2 hover:text-white/80"
							>
								{link.label}
							</a>
						))}
					</div>

					{/* Disclaimer + Copyright */}
					<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div className="flex items-center gap-1">
							<Icon name="open_in_new" size={12} color="text-white" className="shrink-0" />
							<span className="text-xs leading-5 text-white">
								This is an external site may not comply with accessibility guidelines.
							</span>
						</div>
						<span className="text-xs leading-5 text-white">Copyright © ZIPAIR Tokyo Inc.</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
