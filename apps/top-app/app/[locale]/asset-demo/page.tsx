import Image from "next/image";
import { getTopAppAssets } from "@/i18n/asset-service-config";

interface ImageFieldData {
	url?: string | null;
	alt?: string;
	title?: string;
	[key: string]: unknown;
}

export default async function AssetDemoPage({ params }: { params: { locale: string } }) {
	const { locale } = await params;

	// Fetch assets from Prismic via AssetService
	const assets = await getTopAppAssets(locale);

	// Type guard to check if a field is an image
	const isImageField = (value: unknown): value is ImageFieldData => {
		if (typeof value !== "object" || value === null || Array.isArray(value)) {
			return false;
		}
		const obj = value as Record<string, unknown>;
		return typeof obj.url === "string" && obj.url.length > 0;
	};

	// Extract all image fields from assets
	const imageFields = Object.entries(assets).filter(([, value]) => isImageField(value));

	const hasImages = imageFields.length > 0;

	// Handle empty assets
	if (Object.keys(assets).length === 0) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
				<div className="mx-auto max-w-6xl">
					<h1 className="mb-2 font-bold text-4xl text-white">Asset Gallery</h1>
					<p className="mb-8 text-slate-300">
						Locale: <code className="rounded bg-slate-700 px-2 py-1">{locale}</code>
					</p>

					<div className="rounded-lg border border-amber-700 bg-amber-900 p-6">
						<p className="text-amber-100">
							No assets returned from AssetService. Verify the global_assets document exists in
							Prismic for this locale.
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
			<div className="mx-auto max-w-6xl">
				<h1 className="mb-2 font-bold text-4xl text-white">Asset Gallery</h1>
				<p className="mb-8 text-slate-300">
					Locale: <code className="rounded bg-slate-700 px-2 py-1">{locale}</code> • Found{" "}
					<span className="font-mono text-green-400">{imageFields.length}</span> images
				</p>

				{hasImages ? (
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{imageFields.map(([fieldName, fieldData]) => {
							const typedData = fieldData as ImageFieldData;
							const imageUrl = typedData.url;
							const altText = typedData.alt || fieldName;

							return (
								<div
									key={fieldName}
									className="overflow-hidden rounded-lg bg-slate-700 shadow-lg transition-shadow hover:shadow-xl"
								>
									<div className="relative h-48 w-full bg-slate-600">
										{imageUrl && (
											<Image
												src={imageUrl}
												alt={altText}
												fill
												className="object-cover"
												sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
											/>
										)}
									</div>

									<div className="p-4">
										<h3 className="mb-2 font-mono text-slate-300 text-sm">{fieldName}</h3>
										{typedData.alt && (
											<p className="mb-3 text-slate-200 text-xs">{typedData.alt}</p>
										)}
										<a
											href={imageUrl as string}
											target="_blank"
											rel="noopener noreferrer"
											className="truncate break-all font-mono text-blue-400 text-xs hover:text-blue-300"
										>
											{imageUrl}
										</a>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="rounded-lg border border-amber-700 bg-amber-900 p-6">
						<p className="text-amber-100">No image fields detected in the asset response.</p>
					</div>
				)}
			</div>
		</div>
	);
}
