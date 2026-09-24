"use client";

interface BlobConfigurationCardProps {
	isConfigured: boolean;
	blobLength: number;
	onUpdateClick: () => void;
}

export function BlobConfigurationCard({
	isConfigured,
	blobLength,
	onUpdateClick,
}: BlobConfigurationCardProps) {
	return (
		<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-bold text-gray-900">Arkose Configuration</h3>
			</div>

			<div className="space-y-3">
				{/* Blob Status */}
				<div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
					<span className="font-medium text-gray-700 text-sm">Blob Status:</span>
					<div className="flex items-center gap-2">
						{isConfigured ? (
							<>
								<span className="text-green-600 text-lg">✅</span>
								<span className="font-semibold text-green-600">Configured</span>
							</>
						) : (
							<>
								<span className="text-lg text-red-600">❌</span>
								<span className="font-semibold text-red-600">Not Configured</span>
							</>
						)}
					</div>
				</div>

				{/* Blob Length */}
				{isConfigured && (
					<div className="flex items-center justify-between rounded-lg bg-blue-50 p-3">
						<span className="font-medium text-gray-700 text-sm">Blob Length:</span>
						<span className="font-mono font-semibold text-blue-600">{blobLength}</span>
					</div>
				)}

				{/* Update Button */}
				<button
					type="button"
					onClick={onUpdateClick}
					className={`w-full rounded-lg px-4 py-2 font-semibold transition-colors ${
						isConfigured
							? "border border-blue-600 bg-white text-blue-600 hover:bg-blue-50 active:bg-blue-100"
							: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
					}`}
				>
					{isConfigured ? "Update Blob" : "Configure Blob"}
				</button>
			</div>
		</div>
	);
}
