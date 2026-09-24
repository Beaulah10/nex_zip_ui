import { Spinner } from "@repo/ui/components/spinner";

export const LoadingOverlay = () => {
	return (
		<div className="fixed inset-0 z-12 flex min-h-screen items-center justify-center bg-black/50">
			<div className="text-center flex flex-col items-center gap-2">
				<Spinner size="xl" />
				<p className="font-bold text-2xl leading-9 text-white">loading</p>
			</div>
		</div>
	);
};
