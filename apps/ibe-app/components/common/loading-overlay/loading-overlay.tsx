import { Spinner } from "@repo/ui/components/spinner";

export const LoadingOverlay = () => {
	return (
		<div className="fixed inset-0 z-12 flex min-h-screen items-center justify-center bg-black/50">
			<div className="text-center">
				<Spinner size="xl" />
			</div>
		</div>
	);
};
