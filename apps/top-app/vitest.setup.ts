import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

vi.mock("next-intl", () => ({
	useTranslations: () =>
		Object.assign(
			(key: string, values?: Record<string, string>) => {
				const map: Record<string, string> = {
					placeholder_arrival: "Arrival Location",
					placeholder_departure: "Departure Location",
					arrival_modal_heading: "Select Destination(Country/Region)",
					departure_modal_heading: "Select the Origin Airport",
					via_tokyo_narita: "via Tokyo Narita (NRT)",
					arrival_not_selected:
						"You have not selected an arrival destination. Please click here to select the arrival destination.",
					arrival_selected:
						"You have selected {value}. Please click here to change the Arrival Location.",
					departure_selected:
						"You have selected {value}. Please click here to change the Departure Location.",
					passenger_modal_heading: "Select Number of Passengers",
					header_title: "Please select your age as of the boarding date.",
					summary_single: "Passenger",
					summary_multiple: "Passengers",
					error_multiple: "Please confirm the number of people below.",
					label_adult: "Adult",
					description_adult: "15 years and older",
					label_child_infant: "Child/Infant",
					label_child_12_14: "12-14 years",
					label_child_7_11: "7-11 years",
					label_child_2_6: "2-6 years",
					label_infant_0_1: "0-1 year",
					description_infant_0_1: "Children under 8 days old are not allowed to board.",
					button_confirm_selection: "Confirm Selection",
					passenger_modal_bullet1:
						"Passengers who require special assistance will not be able to reserve via this Website.",
					passenger_modal_bullet2:
						"Passengers who require assistance or use of two seats (by physical reason), please see here Passengers who require assistance.",
					passenger_modal_bullet3:
						"For customers under 6 years old, some reservation deadlines are different, please kindly see FAQ.",
					passenger_modal_bullet4:
						"If a child under 1 year old or weighing less than 9kg is traveling, reservations cannot be made through our website. Please contact us to make a reservation.",
					link_assistance: "Passengers who require assistance.",
					link_faq: "FAQ.",
					child_alert_heading: "Regarding Boarding for Passengers Under 2 Years Old",
					child_alert_bullet1:
						"Customers weighing less than 9 kg cannot make reservations online. Please contact the call center to make your reservation. (Depending on availability, it may not be possible to secure a ticket.)",
					child_alert_bullet2:
						"If there is a change in weight to 9 kg or more (or less than 9 kg) between the reservation and boarding, please inform the call center or at check-in.",
					child_alert_bullet3:
						"To protect children from sudden turbulence, please use the child seat provided by our company at all times. Children under 9 kg must be seated facing backward, while those over 9 kg must be seated facing forward.",
					child_alert_bullet4:
						"If all backward-facing seats are full, you will need to secure your child's seat next to an adult, who will then hold the child on their lap.",
					button_child_seat: "About the Use of Child Seats",
					button_contact_center: "Contact Center Inquiries",
					passport_modal_heading: "Please keep your Passport ready",
					header_description:
						"Please make sure to provide following information while making a reservation.",
					item_passport_number: "Passport Number",
					item_expiry_date: "Date of Expiry",
					note_travel_period: "*Please check the remaining period of travel at your destination.",
					item_date_of_birth: "Date of Birth",
					item_nationality_region: "Nationality/Region",
					passport_modal_button_cancel: "Cancel",
					button_next: "Next",
				};

				let text = map[key] ?? key;
				if (values) {
					for (const [k, v] of Object.entries(values)) {
						text = text.replace(`{${k}}`, String(v));
					}
				}

				return text;
			},
			{
				raw: (key: string) =>
					key === "lists.airports"
						? [
								{
									iata_code: "NRT",
									city: "Tokyo",
									airport: "Narita International Airport",
									country: "Japan",
									display_order: 1,
								},
								{
									iata_code: "SIN",
									city: "Singapore",
									airport: "Changi Airport",
									country: "Singapore",
									display_order: 2,
								},
								{
									iata_code: "ICN",
									city: "Seoul",
									airport: "Incheon International Airport",
									country: "South Korea",
									display_order: 3,
								},
								{
									iata_code: "BKK",
									city: "Bangkok",
									airport: "Suvarnabhumi Airport",
									country: "Thailand",
									display_order: 4,
								},
							]
						: key,
			}
		),
}));

afterEach(() => {
	cleanup();
});
