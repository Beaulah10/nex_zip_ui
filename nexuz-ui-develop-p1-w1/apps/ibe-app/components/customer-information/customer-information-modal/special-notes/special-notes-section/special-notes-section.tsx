/**
 * File: special-notes.tsx
 * Description: Special Notes component that groups all additional passenger information sections.
 * It renders travel documents, pregnancy details, assistance requirements, and service dog information.
 */

import { AssistanceSection } from "@/components/customer-information/customer-information-modal/special-notes/assistance-section/assistance-section";
import { PregnantSection } from "@/components/customer-information/customer-information-modal/special-notes/pregnant-section/pregnant-section";
import { ServiceDogsSection } from "@/components/customer-information/customer-information-modal/special-notes/service-dogs-section/service-dogs-section";
import { TravelDocumentsSection } from "@/components/customer-information/customer-information-modal/special-notes/travel-documents/travel-documents";

/** Special Notes function that groups travel document section, pregnant section, assistance section, and service dogs section. */
export function SpecialNotes() {
	return (
		<>
			<TravelDocumentsSection />
			<PregnantSection />
			<AssistanceSection />
			<ServiceDogsSection />
		</>
	);
}
