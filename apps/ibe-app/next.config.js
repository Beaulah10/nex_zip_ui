import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isProduction = process.env.NODE_ENV === "production";

// Content Security Policy
//
// Directives are intentionally explicit rather than relying solely on
// default-src so that each fetch category is opt-in.
//
// script-src / style-src include 'unsafe-inline' because Next.js App Router
// embeds inline hydration scripts and style tags at runtime.  To remove
// 'unsafe-inline' from script-src, wire up a per-request nonce via
// Next.js middleware (next/headers + generateNonce) and pass it to
// next.config headers() — that is the recommended next hardening step.
//
// Prismic API calls are made server-side (Route Handlers / Server
// Components) so they do not need a connect-src entry.
const cspDirectives = [
	"default-src 'self'",
	// Next.js inline hydration scripts require 'unsafe-inline' without nonces
	// Arkose Labs challenge widget script
	// 'unsafe-eval' needed in development for React debugging features
	`script-src 'self' 'unsafe-inline' ${isProduction ? "" : "'unsafe-eval'"} https://zipair-api.arkoselabs.com`,
	// Next.js injects inline critical styles
	"style-src 'self' 'unsafe-inline'",
	// Fonts are self-hosted (NotoSans woff2 from @repo/global-styles)
	"font-src 'self'",
	// Prismic CMS may serve content images; data: and blob: used by
	// Next.js <Image> optimisation and canvas operations
	"img-src 'self' data: blob: https://images.prismic.io",
	// All browser → server calls go through the same-origin BFF (/booking/api/*)
	// Arkose Labs API calls for challenge verification
	"connect-src 'self' https://zipair-api.arkoselabs.com https://api.arkoselabs.com",
	// Arkose Labs loads challenge widget in iframe
	"frame-src https://zipair-api.arkoselabs.com",
	// Tesseract.js (passport scan OCR) creates Web Workers from blob: URLs
	"worker-src blob: 'self'",
	"media-src 'self'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
].join("; ");

const securityHeaders = [
	{
		key: "Content-Security-Policy",
		value: cspDirectives,
	},
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	...(isProduction
		? [
				{
					key: "Strict-Transport-Security",
					value: "max-age=63072000; includeSubDomains; preload",
				},
			]
		: []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
	transpilePackages: ["@repo/cms"],
	basePath: "/booking",
	output: "standalone",
	images: {
		// Prismic's CDN already resizes/optimizes images on the fly. Bypassing Next's
		// own optimizer avoids a known dev-server race condition where concurrent
		// /_next/image requests can intermittently serve the wrong cached image.
		unoptimized: true,
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.prismic.io",
				pathname: "/**",
			},
		],
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
		];
	},
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const initialEnvKeys = new Set(Object.keys(process.env));

for (const envFilePath of [
	path.resolve(__dirname, "../../.env"),
	path.resolve(__dirname, "../../.env.local"),
	path.resolve(__dirname, ".env"),
	path.resolve(__dirname, ".env.local"),
]) {
	loadEnvFile(envFilePath);
}

export default withNextIntl(nextConfig);

function loadEnvFile(envFilePath) {
	if (!fs.existsSync(envFilePath)) {
		return;
	}

	const file = fs.readFileSync(envFilePath, "utf8");

	for (const line of file.split(/\r?\n/)) {
		const trimmedLine = line.trim();

		if (!trimmedLine || trimmedLine.startsWith("#")) {
			continue;
		}

		const separatorIndex = trimmedLine.indexOf("=");

		if (separatorIndex === -1) {
			continue;
		}

		const key = trimmedLine.slice(0, separatorIndex).trim();
		const value = trimmedLine.slice(separatorIndex + 1).trim();

		if (!key || initialEnvKeys.has(key)) {
			continue;
		}

		process.env[key] = value.replace(/^["']|["']$/g, "");
	}
}
