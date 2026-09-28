import { AxiosError } from "axios";

export function getApiErrorMessage(error: unknown, fallback: string) {
	if (error instanceof AxiosError) {
		const responseMessage = readResponseMessage(error.response?.data);

		return responseMessage ?? error.message ?? fallback;
	}

	return error instanceof Error ? error.message : fallback;
}

function readResponseMessage(data: unknown) {
	if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
		return data.message;
	}

	return undefined;
}
