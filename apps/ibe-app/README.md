# ibe-app

## Purpose

`ibe-app` is the Next.js application for the Nexuz flight booking experience. It owns the customer-facing booking flow, localized booking pages, and the BFF-style API routes that translate frontend requests into backend flight shopping and ancillary service call.

In domain terms, this app supports route discovery, flight search, calendar fare lookup, bundle and ancillary retrieval, and the localized booking UI shown to customers during shopping.

## Architecture

This application is a Next.js App Router frontend inside the `nexuz-ui` pnpm workspace.

```text
apps/ibe-app/
├── app/              # App Router pages, providers, and API routes
├── components/       # Booking flow UI by domain area
├── i18n/             # Locale routing and message loading
├── messages/         # Local translation JSON files
├── mock/             # Mock data used for development and tests
├── modules/          # Feature services, helpers, and domain logic
├── store/            # Redux state and persistence setup
├── styles/
├── test/
└── types/
```

Key design decisions:

- Localized routes are handled through the App Router under `app/[locale]`.
- Customer booking UI is organized by booking domain under `components/`, such as flight selection, passenger details, extras, seat map, and bundle selection.
- Server-side API routes under `app/api` work as a lightweight BFF layer between the browser and backend services.
- Shared UI, SDK, CMS utilities, and global styles come from workspace packages instead of app-local duplicates.
- Backend access is environment-driven so the app can run against real backend services or local/mock integrations depending on configuration.

## Getting Started

Prerequisites:

- Node.js 18 or newer
- pnpm 9.0.0

Installation and local development from the repository root:

```bash
pnpm install
pnpm --filter ibe-app dev
```

Open `http://localhost:3000` after filling in the required environment variables.

Common app commands:

| Command | Description |
|---|---|
| `pnpm --filter ibe-app dev` | Start the IBE app on port 3000 |
| `pnpm --filter ibe-app build` | Build the app for production |
| `pnpm --filter ibe-app start` | Start the production build |
| `pnpm --filter ibe-app lint` | Run Biome linting for the app |
| `pnpm --filter ibe-app check-types` | Run Next.js type generation and TypeScript checks |
| `pnpm --filter ibe-app test` | Run Vitest test suite |
| `pnpm --filter ibe-app test:watch` | Run Vitest in watch mode |
| `pnpm --filter ibe-app test:coverage` | Run coverage-enabled tests |

## Environment Variables

Use the shared repository `.env.example` as the starting point and provide values needed by this application. Never commit real secrets.

| Variable | Description |
|---|---|
| `API_SOURCE` | Backend integration mode for API-dependent flows |
| `BACKEND_API_BASE_URL` | Base URL for backend REST APIs used by app routes and services |
| `BACKEND_API_TOKEN` | Static backend bearer token when required by the integration |
| `IBE_LABEL_SOURCE` | Label source selector, typically `local`, `prismic`, or API-driven depending on environment |
| `IBE_PRISMIC_DOCUMENT_TYPE` | Prismic document type for IBE labels when using Prismic-backed labels |
| `IBE_LABELS_API_URL` | Labels endpoint used when labels are served by API |
| `NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME` | Browser-exposed Prismic repository name |
| `PRISMIC_REPOSITORY_NAME` | Server-side Prismic repository slug |
| `PRISMIC_ACCESS_TOKEN` | Read-only token for Prismic-backed content or labels |
| `IBE_DEBUG_LABEL_FLOW` | Enables additional label-flow diagnostics when supported |
| `SDK_DEBUG` | Enables SDK-level debug logging |
| `NODE_TLS_REJECT_UNAUTHORIZED` | Local-only TLS override for non-production environments |

## API Overview

- `ibe-app` serves localized booking pages through the App Router.
- It exposes BFF-style route handlers under `app/api` for shopping and support endpoints.
- It consumes the shared SDK and workspace packages rather than maintaining a separate public API contract in this folder.

| Route | Method | Purpose |
|---|---|---|
| `/api/health` | `GET` | Runtime health check returning an OK payload |
| `/api/route-info` | `GET` | Returns supported route combinations for the booking domain |
| `/api/search/flights` | `GET` | Searches flights from route, passenger, date, language, and currency inputs |
| `/api/search/calendar-fares` | `GET` | Returns fare calendar data for a route/date search |
| `/api/offers/bundles` | `GET` | Returns bundle offers used in the booking flow |
| `/api/offers/ancillaries` | `GET` | Returns ancillary offers used in the booking flow |

The application consumes `@repo/sdk`, `@repo/ui`, `@repo/cms`, and `@repo/global-styles` from the workspace. Backend request behavior is controlled by the shared SDK and app-local service modules.

## Testing

Run app-specific tests and checks from the repository root:

```bash
pnpm --filter ibe-app test
pnpm --filter ibe-app test:coverage
pnpm --filter ibe-app check-types
pnpm --filter ibe-app lint
```

## Deployment

`ibe-app` is the primary customer-facing deployment target documented in this repository. Builds run through the workspace CI pipeline, production artifacts are packaged as a Docker image, deployment targets AWS infrastructure through the repository deployment workflows, and runtime configuration is provided through environment variables and deployment-managed secrets.

If your team maintains an application-specific operational runbook outside this repository, link it here.

## Ownership

- IBE App team owns the booking flow UI, localized messages, and app-specific API orchestration in `ibe-app`.
- Shared package maintainers own the shared UI, SDK, CMS helpers, and global styles consumed by this app.

If ownership is broader in practice, add the exact escalation group or teams alias here.
