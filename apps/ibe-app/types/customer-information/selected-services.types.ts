/**
 * File: selected-services.types.ts
 * Description: Type definitions for selected services associated with passengers during the booking process.
 * It defines the service data model and Redux state structure used to manage selected services throughout the Customer Information and booking workflow.
 */

// ── Selected Service ──────────────────────────────────────────────────────────

export interface SelectedService {
	lfid: number;
	amount: number;
	categoryId: number;
	cutOffHours: number;
	description: string;
	maxCountServiceLevel: number;
	passengerType: string;
	qtyAvailable: number;
	ssrCode: string;
	serviceID: number;
	passengerId: string;
	pfid: number;
	chargeComment: string;
	bundleCode: string;
}

// ── Selected Services State ───────────────────────────────────────────────────

export interface PassengerServices {
	id: string;
	services: SelectedService[];
}

export interface SelectedServicesState {
	passengers: PassengerServices[];
}
