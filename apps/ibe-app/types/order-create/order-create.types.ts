import type { NEXUZR005APIsCreateOrderRequest, NEXUZR005APIsCreateOrderResponse } from "@repo/sdk";

export type OrderCreateApiError = {
	message: string;
	code?: string;
	status?: number;
};

export type OrderCreateState = {
	isPending: boolean;
	request?: NEXUZR005APIsCreateOrderRequest;
	response?: NEXUZR005APIsCreateOrderResponse;
	error?: OrderCreateApiError;
};
