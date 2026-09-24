# top-app

## Purpose

`top-app` is a Next.js frontend in the Nexuz monorepo that reuses the shared UI and SDK packages to deliver a localized flight-search-oriented experience outside the main booking app. It focuses on route discovery, calendar fare retrieval, token-aware backend access, and related support endpoints used by the top-level customer experience.

In domain terms, this app supports localized flight search entry, airport route retrieval, fare discovery, and frontend-to-backend orchestration for customer-facing search scenarios.

## Architecture

This application is a Next.js App Router frontend inside the `nexuz-ui` pnpm workspace.

```text
apps/top-app/
├── app/              # App Router pages, providers, and API routes
├── components/       # Top-app-specific UI such as flight search features
├── i18n/             # Locale routing and message loading
├── lib/              # Shared app-local fetch utilities
├── messages/         # Local translation JSON files
├── modules/          # Feature services, helpers, and domain logic
├── store/            # Redux state and persistence setup
├── styles/
└── types/
```

Key design decisions:

- The localized customer entry point lives under `app/[locale]` and loads route data server-side before rendering the flight search UI.
- App-local API routes under `app/api` provide BFF behavior for backend access, diagnostics, and token cleanup.
- Backend calls are centralized through app services and lightweight fetch helpers in `lib/` and `api-client/`.
- Shared UI, CMS utilities, SDK clients, and styles come from workspace packages to keep behavior aligned with the wider monorepo.
- Error handling is normalized in domain helpers so route-level failures can be converted into user-facing boundary states.

## Getting Started

Prerequisites:

- Node.js 18 or newer
- pnpm 9.0.0

Installation and local development from the repository root:

```bash
pnpm install
pnpm --filter top-app dev
```

Open `http://localhost:3002` after filling in the required environment variables.

Common app commands:

| Command | Description |
|---|---|
| `pnpm --filter top-app dev` | Start the top app on port 3002 |
| `pnpm --filter top-app build` | Build the app for production |
| `pnpm --filter top-app start` | Start the production build |
| `pnpm --filter top-app lint` | Run Biome checks for the app |
| `pnpm --filter top-app format` | Apply Biome formatting |
| `pnpm --filter top-app check-types` | Run Next.js type generation and TypeScript checks |
| `pnpm --filter top-app test` | Run Vitest test suite |
| `pnpm --filter top-app test:watch` | Run Vitest in watch mode |
| `pnpm --filter top-app test:coverage` | Run coverage-enabled tests |

## Environment Variables

Use the shared repository `.env.example` as the starting point and provide values needed by this application. Never commit real secrets.

| Variable | Description |
|---|---|
| `API_SOURCE` | Backend integration mode for search-related services |
| `BACKEND_API_BASE_URL` | Base URL for backend REST APIs called by app services and route handlers |
| `IBE_LABEL_SOURCE` | Label source selector used by shared label-loading flows |
| `IBE_PRISMIC_DOCUMENT_TYPE` | Prismic document type used when labels are Prismic-backed |
| `IBE_LABELS_API_URL` | Labels endpoint used when label source is API-driven |
| `PRISMIC_REPOSITORY_NAME` | Prismic repository slug used by shared CMS integrations |
| `PRISMIC_ACCESS_TOKEN` | Read-only Prismic API token |

## API Overview

- `top-app` serves localized pages through the App Router.
- It exposes a small set of BFF and utility endpoints under `app/api`.
- It consumes the shared SDK and workspace UI packages rather than defining its own independent API contract in this folder.

| Route | Method | Purpose |
|---|---|---|
| `/api/health` | `GET` | Runtime health check returning an OK payload |
| `/api/search/calendar-fares` | `GET` | Retrieves calendar fares for localized search flows |
| `/api/debug-headers` | `GET` | Returns request header diagnostics such as geo and language headers |
| `/api/clear-auth-token` | `POST` | Clears the security token cookie used for backend-integrated flows |

The app uses `@repo/sdk`, `@repo/ui`, `@repo/cms`, and `@repo/global-styles` from the workspace. Backend requests are typically built relative to `BACKEND_API_BASE_URL`, with optional security-token forwarding when required.

## Testing

Run app-specific tests and checks from the repository root:

```bash
pnpm --filter top-app test
pnpm --filter top-app test:coverage
pnpm --filter top-app check-types
pnpm --filter top-app lint
```

## Deployment

`top-app` follows the same monorepo build and deployment conventions as the other customer-facing Next.js applications. Production artifacts are built with Next.js, packaged through the repository deployment flow, and configured at runtime through deployment-managed environment variables and secrets.

If deployment ownership or infrastructure differs from the workspace defaults, document the exact workflow here.

## Ownership

- The team responsible for the top-level customer experience owns `top-app` pages, route handlers, and app-local services.
- Shared package maintainers own the workspace SDK, shared UI components, CMS helpers, and styling consumed by this app.

If your organization uses a formal team alias or escalation path for `top-app`, add it here.
