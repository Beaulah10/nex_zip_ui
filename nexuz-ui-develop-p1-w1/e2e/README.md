# E2E Handover Guide

## Scope

This `e2e` package is intentionally trimmed to handover scope and currently maintains the booking flow smoke scenarios under `booking-flows`.

Included scenarios:

- `one-way.spec.ts`
- `roundtrip.spec.ts`
- `connecting-one-way.spec.ts`

## What The Suite Validates

The suite verifies the booking flow starting from the top-app search page and ending on the traveler information page.

Covered flows:

1. one-way booking
2. roundtrip booking
3. connecting one-way booking

## Implementation Summary

The tests use Playwright and are intentionally implemented as a stable handover smoke pack.

### Runtime model

- The flow starts from the real top-app E2E route: `/en/e2e/flight-search`
- Shared logic lives in `booking-flows/helpers.ts`
- Required API responses are mocked through Playwright route interception
- Downstream booking pages are also mocked with lightweight HTML shells returned from route handlers

This approach keeps the suite deterministic and reduces failures caused by live backend or downstream UI volatility.

## Important Files

- `package.json`: execution scripts
- `playwright.config.ts`: Playwright project definition and local server startup
- `booking-flows/helpers.ts`: mock data, route handlers, and flow helpers
- `booking-flows/*.spec.ts`: scenario-specific tests

## Prerequisites

From the repository root install dependencies:

```bash
pnpm install
```

The suite runs against top-app on port `3002` by default.

## How To Execute

From the repository root:

```bash
pnpm --filter e2e test
```

Alternative commands:

```bash
pnpm --filter e2e test:flows
pnpm --filter e2e test:flows:headed
pnpm --filter e2e report
```

## Environment Variable

Supported override:

- `TOP_BASE_URL`: custom base URL for top-app

Example:

```bash
TOP_BASE_URL=http://localhost:3002 pnpm --filter e2e test
```

If `TOP_BASE_URL` is not supplied, Playwright starts top-app automatically using:

```bash
pnpm --filter top-app dev
```

## How The Flows Are Structured

### Shared helper responsibilities

`helpers.ts` contains:

- search form interaction helpers
- mock fare and flight-selection payloads
- mocked booking pages for flight selection, bundles, customize, extras, and traveler information
- reusable completion steps used by all scenarios

### Scenario data

- one-way: NRT to SIN
- roundtrip: NRT to SIN with return leg
- connecting one-way: BKK to SIN via NRT

## Cleanup Applied For Handover

The package has been reduced to smoke-level booking flow coverage only.

Removed from active scope:

- separate `ibe-app` Playwright project
- non-primary-path scripts
- `ibe-app/functional/`
- `top-app/functional/`

Generated artifacts such as reports can be recreated when tests are executed.

## Recommendation

Treat this suite as a smoke-level regression pack for handover. If future scope expands, add new flows as separate folders instead of mixing them into the current suite.