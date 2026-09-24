# nexuz-ui

## Purpose

`nexuz-ui` is a pnpm workspace monorepo for Nexuz customer-facing web applications and their shared frontend building blocks. It contains the flight booking application, an additional Next.js frontend that reuses shared packages, and shared workspace packages for UI, styling, CMS integration, TypeScript configuration, and the generated SDK.

In domain terms, the repository supports flight shopping and booking flows, shared customer-facing UI, and the supporting frontend integrations used by those application.

## Architecture

This repository is a Turborepo-managed monorepo using pnpm workspaces.

```text
nexuz-ui/
├── apps/
│   ├── ibe-app/       # Next.js booking interface
│   ├── prismic-app/   # CMS companion app
│   └── top-app/       # Next.js frontend consuming shared packages and SDK
├── packages/
│   ├── cms/           # Shared CMS helpers and integration code
│   ├── global-styles/ # Shared fonts and global CSS
│   ├── sdk/           # Generated OpenAPI-based client and interfaces
│   ├── typescript-config/
│   └── ui/            # Shared React UI components and utilities
└── docs/              # Project and workflow documentation
```

Key design decisions:

- Shared UI, styles, CMS utilities, and generated API clients live in `packages/*` so multiple applications can consume the same abstractions.
- Build orchestration is handled by Turborepo to keep build, lint, typecheck, and test workflows consistent across apps and packages.
- `ibe-app` and `top-app` consume local workspace packages instead of duplicating component or API logic.
- The SDK package is generated from `packages/sdk/swagger.yaml`, which is the tracked API contract in this repository.

## Getting Started

Prerequisites:

- Node.js 18 or newer
- pnpm 9.0.0

Installation and local development:

```bash
pnpm install
pnpm dev
```

You can also run a single application:

```bash
pnpm --filter ibe-app dev
pnpm --filter top-app dev
pnpm --filter prismic-app dev
```

Common root commands:

| Command | Description |
|---|---|
| `pnpm dev` | Start workspace development tasks through Turborepo |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Run lint tasks across the workspace |
| `pnpm check` | Run Biome checks across the repository |
| `pnpm check:fix` | Apply safe Biome fixes |
| `pnpm check:fix:unsafe` | Apply Biome fixes including unsafe ones |
| `pnpm check-types` | Run TypeScript checks across the workspace |
| `pnpm test` | Run test tasks across the workspace |
| `pnpm test:coverage` | Run coverage-enabled test tasks across the workspace |

## Environment Variables

Use the shared repository `.env.example` as the starting point. Never commit real secrets.

| Variable | Required for | Description |
|---|---|---|
| `PRISMIC_REPOSITORY_NAME` | All apps | Prismic repository slug used by CMS-integrated applications |
| `PRISMIC_ACCESS_TOKEN` | All apps | Read-only Prismic API token |
| `PRISMIC_WRITE_TOKEN` | `prismic-app` scripts | Migration/write token for Prismic content operations |
| `IBE_LABEL_SOURCE` | `ibe-app`, `top-app` | Label source selector such as `local`, `prismic`, or API-driven |
| `IBE_PRISMIC_DOCUMENT_TYPE` | `ibe-app`, `top-app` | Prismic document type containing IBE labels |
| `IBE_LABELS_API_URL` | `ibe-app`, `top-app` | Remote labels endpoint when label source is API-driven |
| `API_SOURCE` | `ibe-app`, `top-app` | Backend integration mode such as `backend` or `mock` |
| `BACKEND_API_BASE_URL` | `ibe-app`, `top-app` | Base URL for backend REST APIs |
| `BACKEND_API_TOKEN` | `ibe-app`, `top-app` | Static bearer token for backend API requests |
| `NEXT_PUBLIC_PRISMIC_REPOSITORY_NAME` | `ibe-app`, `top-app` | Browser-exposed Prismic repository name |
| `LABEL_SOURCE` | `prismic-app` | Source for Prismic app scripts |

## API Overview

Applications and interfaces exposed from this repository:

- `apps/ibe-app` exposes Next.js route handlers under `apps/ibe-app/app/api`.
- `apps/top-app` exposes Next.js route handlers under `apps/top-app/app/api`.
- `packages/sdk` exposes the generated shared client from the OpenAPI contract at `packages/sdk/swagger.yaml`.

Current documented `ibe-app` routes:

| Route | Method | Purpose |
|---|---|---|
| `/api/health` | `GET` | Runtime health check returning `{ "status": "ok" }` |
| `/api/route-info` | `GET` | Returns static route combinations used by the booking domain |

OpenAPI spec:

- `packages/sdk/swagger.yaml`

To refresh generated client code:

## Testing

Run tests from the repository root:

```bash
pnpm test
pnpm test:coverage
pnpm check
pnpm check-types
pnpm prismic:check
```

Target a specific app when needed:

```bash
pnpm --filter ibe-app test
pnpm --filter top-app test
```

## Deployment

The repository contains GitHub Actions-based deployment automation for `ibe-app`. CI runs through reusable workflow gates, Docker images are built and pushed to AWS ECR, and deployment targets AWS ECS using the repository workflows and `scripts/deploy-latest-ecr-to-ecs.sh`.

If your team maintains an external operational runbook, link it here.

## Ownership

Based on repository documentation currently checked in:

- IBE App team owns the booking app UI pages and local label content.
- Prismic team owns Prismic custom types, migration scripts, Slice Machine sync, and Prismic content migration.

If repository-wide ownership is broader than those two teams, add the exact team name or escalation group here.
