# AssetService — Enterprise Media Asset Layer

AssetService provides a scalable, type-safe CMS layer for managing Prismic media assets (images, icons, PDFs, videos) across Next.js applications.

## Purpose

- **Fetch and cache** media assets from Prismic
- **Support locales** without duplication
- **Enable schema flexibility** by returning raw Prismic documents
- **Provide cache invalidation** via webhooks
- **Share across applications** (ibe-app, top-app, future apps)

## Architecture

### Core Components

| File | Purpose |
|------|---------|
| `packages/cms/src/services/asset-service.ts` | Service implementation with caching and locale resolution |
| `apps/*/i18n/asset-service-config.ts` | App-specific configuration |
| `apps/top-app/app/[locale]/asset-demo/page.tsx` | Demo/reference implementation |

### Design Principles

1. **Contract-Free**: Returns raw `document.data` from Prismic, enabling schema evolution without code changes
2. **Locale-Aware**: Resolves locales consistently with app routing (e.g., `en` → `en-us` in Prismic)
3. **Cache-First**: Uses Next.js `unstable_cache()` with 24-hour TTL
4. **Webhook-Ready**: Tags enable `revalidateTag()` for immediate invalidation
5. **Graceful Degradation**: Missing assets return empty object, never break the page

## Usage

### Setup (Per Application)

```typescript
// apps/top-app/i18n/asset-service-config.ts

import {
	type AssetService,
	createAssetService,
} from "@repo/cms/services/asset-service";

const assetService = createAssetService({
	applicationName: "top-app",
	defaultLocale: "en",
	locales: ["en", "ja"],
	globalAssetsDocumentType: "global_assets",
	prismicLocaleMap: {
		en: "en-us",
		ja: "ja-jp",
	},
});

export const getTopAppAssets = assetService.getAssets;
export const resolveAssetLocale = (locale?: string) =>
	assetService.resolveLocale(locale);
```

### Fetching Assets in a Server Component

```typescript
// apps/top-app/app/[locale]/some-page.tsx

import { getTopAppAssets } from "@/i18n/asset-service-config";

export default async function SomePage({ params }: { params: { locale: string } }) {
	const assets = await getTopAppAssets(params.locale);

	// assets is Record<string, unknown>
	// Access fields dynamically or with type guards
	const logo = assets.zipair_logo as { url: string; alt: string } | undefined;

	return (
		<div>
			{logo?.url && <Image src={logo.url} alt={logo.alt} width={100} height={100} />}
		</div>
	);
}
```

### Dynamic Image Detection

```typescript
// Detect image fields without hardcoding names
interface ImageFieldData {
	url?: string | null;
	alt?: string;
	[key: string]: unknown;
}

const isImageField = (value: unknown): value is ImageFieldData => {
	if (typeof value !== "object" || value === null) return false;
	const obj = value as Record<string, unknown>;
	return typeof obj.url === "string" && obj.url.length > 0;
};

const imageFields = Object.entries(assets).filter(([, v]) => isImageField(v));
```

## Cache Strategy

### Configuration

- **Lifetime**: 24 hours (86400 seconds)
- **Key Format**: `prismic-assets:{applicationName}:{locale}`
- **Tags**: `prismic-assets:{applicationName}:{locale}` (for webhook invalidation)

### Example Cache Invalidation (Webhook Handler)

```typescript
// app/api/webhooks/prismic/route.ts

import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
	const body = await request.json();
	const { type, documents } = body;

	if (type === "release.published") {
		const tags = [
			`prismic-assets:top-app:en`,
			`prismic-assets:top-app:ja`,
			`prismic-assets:ibe-app:en`,
			`prismic-assets:ibe-app:ja`,
		];

		tags.forEach((tag) => revalidateTag(tag));
	}

	return Response.json({ ok: true });
}
```

## Environment Configuration

```bash
# Enable AssetService (default: "local" for no-op)
ASSET_SOURCE=prismic

# Enable debug logging
IBE_DEBUG_ASSET_FLOW=true
TOP_DEBUG_ASSET_FLOW=true
```

## API Reference

### `createAssetService(options)`

Factory function that returns an `AssetService` instance.

**Options:**
```typescript
{
  applicationName: string;              // e.g., "top-app"
  defaultLocale: string;                // e.g., "en"
  locales: readonly string[];           // e.g., ["en", "ja"]
  globalAssetsDocumentType: string;     // e.g., "global_assets"
  prismicLocaleMap: Record<string, string>;  // e.g., { en: "en-us" }
}
```

**Returns:**
```typescript
{
  getAssets(locale: string): Promise<Record<string, unknown>>;
  resolveLocale(locale?: string): string;
}
```

### `getServerAssetSource()`

Resolves the configured asset source from environment.

**Returns:** `"local" | "prismic"`

## Error Handling

- **No assets document**: Returns `{}` (empty object)
- **Prismic API failure**: Logs error, returns `{}`
- **Locale mismatch**: Falls back to locale without lang parameter
- **Caching**: Failures are NOT cached; errors throw immediately

## Image Component Configuration

Add Prismic CDN domain to `next.config.js`:

```javascript
images: {
	remotePatterns: [
		{
			protocol: "https",
			hostname: "images.prismic.io",
			pathname: "/**",
		},
	],
},
```

## Type Definitions

All types are exported from `asset-service.ts`:

```typescript
import {
	type AssetService,
	type CreateAssetServiceOptions,
} from "@repo/cms/services/asset-service";
```

## Production Readiness

✅ Type-safe TypeScript implementation  
✅ Comprehensive error handling and logging  
✅ Next.js caching with webhook support  
✅ Schema-flexible design (no contract mapping)  
✅ Locale mapping support  
✅ Server Component only (no client handlers)  
✅ Tested with Prismic CDN images  

## Logging

Logs are prefixed with `[asset-service]` and include context:

```
[asset-service] cache: executing uncached prismic asset fetch { applicationName: "top-app", locale: "en" }
[asset-service] cache stored { applicationName: "top-app", locale: "en", cacheLifeSeconds: 86400 }
[asset-service] global assets document not found { locale: "en", documentType: "global_assets" }
```
