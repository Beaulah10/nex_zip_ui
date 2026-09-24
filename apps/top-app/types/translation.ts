import type enMessages from "@/messages/en.json";

export type TopLabels = typeof enMessages;
export type TopLabelSection = keyof TopLabels;

export type PrismicLinkedDocument = {
	id: string;
	data: Record<string, unknown>;
};

export type PrismicLinkValue = {
	id: string;
	link_type: string;
	data?: unknown;
};
