export interface ArkoseProps {
	publicKey: string;
	token?: string;
	selector?: string;
	mode?: "inline" | "lightbox";
	nonce?: string;
	onReady?: () => void;
	onShown?: () => void;
	onCompleted?: (token: string) => void;
	onError?: (error: Error) => void;
}
