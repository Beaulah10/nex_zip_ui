import type { NEXUZR005APIsSummaryRequest, NEXUZR005APIsSummaryResponse } from "@repo/sdk";

export type OrderPrepareApiError = {
	message: string;
	code?: string;
	status?: number;
};

export type OrderPrepareState = {
	isPending: boolean;
	request?: NEXUZR005APIsSummaryRequest;
	response?: NEXUZR005APIsSummaryResponse;
	token?: string;
	error?: OrderPrepareApiError;
};
