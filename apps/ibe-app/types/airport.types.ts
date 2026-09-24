export type AirportMessage = {
	iata_code: string;
	airport: string;
};

export type AirportMessagesShape = {
	flight_selection_page?: {
		airports?: AirportMessage[];
	};
};

export type AirportFullNameMap = Record<string, string>;
