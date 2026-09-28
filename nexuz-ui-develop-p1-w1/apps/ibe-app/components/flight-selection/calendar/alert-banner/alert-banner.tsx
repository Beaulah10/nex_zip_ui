import { Alert, AlertTitle } from "@repo/ui/components/alert";

type AlertBannerProps = {
	message: string;
	variant?: "info" | "error";
};

export default function AlertBanner({ message, variant = "info" }: AlertBannerProps) {
	return (
		<Alert variant={variant}>
			<AlertTitle>{message}</AlertTitle>
		</Alert>
	);
}
