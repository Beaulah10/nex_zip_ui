import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
	const h = request.headers;

	return NextResponse.json(
		{
			cloudfrontViewerAddress: h.get("cloudfront-viewer-address"),
			cloudfrontViewerCountry: h.get("cloudfront-viewer-country"),
			cloudfrontViewerCountryName: h.get("cloudfront-viewer-country-name"),
			cloudfrontViewerCountryRegion: h.get("cloudfront-viewer-country-region"),
			cloudfrontViewerCity: h.get("cloudfront-viewer-city"),
			cloudfrontViewerTimeZone: h.get("cloudfront-viewer-time-zone"),
			xForwardedFor: h.get("x-forwarded-for"),
			language: h.get("accept-language"),
		},
		{
			headers: {
				"Cache-Control": "no-store",
			},
		}
	);
}
