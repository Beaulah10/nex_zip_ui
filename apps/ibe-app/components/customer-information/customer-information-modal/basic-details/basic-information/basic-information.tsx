/**
 * File: basic-information.tsx
 * Description: Basic Information component that combines all passenger information sections.
 * It renders personal details, passport details, contact details, and destination information based on route requirements.
 */

import { ContactSection } from "@/components/customer-information/customer-information-modal/basic-details/contact-section/contact-section";
import { DestinationSection } from "@/components/customer-information/customer-information-modal/basic-details/destination-section/destination-section";
import { PassportSection } from "@/components/customer-information/customer-information-modal/basic-details/passport-section/passport-section";
import { PersonalInformation } from "@/components/customer-information/customer-information-modal/basic-details/personal-information/personal-information";
import type { Passenger } from "@/types/customer-information/customer-information.types";

/**
 * Basic Information component that groups personal information, passport details, contact information, and destination details (render conditionally for us or thai routes).
 */
export function BasicInformation({
	passenger,
	isUsRoute,
	isThaiRoute,
	isPrimary,
	onClickCopyToPassenger,
}: Readonly<{
	passenger: Passenger;
	isUsRoute: boolean;
	isThaiRoute: boolean;
	isPrimary: boolean;
	onClickCopyToPassenger: () => void;
}>) {
	return (
		<>
			<PersonalInformation passenger={passenger} isUsRoute={isUsRoute} />
			<PassportSection />
			<ContactSection isUsRoute={isUsRoute} isPrimary={isPrimary} />
			{(isUsRoute || isThaiRoute) && (
				<DestinationSection onClickCopyToPassenger={onClickCopyToPassenger} />
			)}
		</>
	);
}
