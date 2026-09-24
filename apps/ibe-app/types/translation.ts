import type enMessages from "../messages/en.json";

export type IbeLabels = typeof enMessages;
export type IbeLabelSection = keyof IbeLabels;

export type PrismicLinkedDocument = {
	id: string;
	data: Record<string, unknown>;
};

export type PrismicLinkValue = {
	id: string;
	link_type: string;
	data?: unknown;
};
