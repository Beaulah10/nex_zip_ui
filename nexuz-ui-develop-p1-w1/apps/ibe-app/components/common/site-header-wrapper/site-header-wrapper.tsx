"use client";

import { SiteHeader } from "@repo/ui/components/site-header";
import { useBackNavigation } from "@/modules/hooks/common/back-navigation/use-back-navigation";

interface SiteHeaderWrapperProps {
	className?: string;
	showBackArrow?: boolean;
}

export function SiteHeaderWrapper(props: SiteHeaderWrapperProps) {
	const handleBackClick = useBackNavigation();

	return <SiteHeader {...props} onBackClick={handleBackClick} />;
}
