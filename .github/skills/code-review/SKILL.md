---
name: code-review
description: >
  Comprehensive development and PR review checklist for Nexu-Z repositories.
  Covers governance, CI/CD, security, Next.js patterns, component architecture,
  performance, and code quality. Reviews produce a local report only.
argument-hint: <repo-path|PR-URL>
---

# Development and PR Review Checklist

Review a Nexu-Z development repository or GitHub PR against the local review references. The review is read-only apart from creating the report under `tmp/reviews/`. Do not modify the target source repository.

## Local Review References

Load these files from the target repository before performing checks:

1. `.github/docs/development-checklist.md` is the primary sprint-level workflow.
2. `.github/docs/coding-guidelines.md` is the detailed compliance reference.
3. `.github/docs/governance-policy-rules.md` provides governance traceability when a finding needs it.
4. `.github/docs/PII_code_compliance_review_checklist.md` is the mandatory PII/privacy compliance reference (GDPR, PIPA, CCPA, COPPA, ePrivacy, CAN-SPAM, Japanese e-commerce laws, airline regulations).

Apply the checklist first, then use the coding guidelines to expand applicable findings. Use only the local `.github/docs/` references listed above. All four references are mandatory for every review — do not omit the PII checklist even if the change appears unrelated to personal data.

## Target and Layer Detection

Accepted targets are local repository paths, GitHub repository URLs, `<owner>/<repo>`, GitHub PR URLs, and `<owner>/<repo>#<PR>`.

Determine the application layer from the repository name, README, dependencies, and project files:

- `package.json` containing React, Next.js, or Vue indicates frontend.
- Express/Fastify with gateway patterns or AWS API Gateway IaC indicates API gateway.
- `go.mod`, `pom.xml`, `pyproject.toml`, or a backend Node.js application indicates backend microservice.

If the layer is ambiguous, record the ambiguity in the report and avoid unsupported layer-specific claims.

## Review Workflow

### 1. Access the Target

- Local repository: inspect directly in read-only mode.
- Repository or PR URL: inspect repository metadata and relevant files with the available GitHub tooling.
- PR mode: review changed files and the target commit SHA. Use the PR diff to scope line-specific findings.

Do not stash, reset, switch branches, or otherwise contaminate the target working tree.

Out of scope for all sections below: changes inside `.github/skills/**`, `.github/agents/**`, `.github/docs/**`, `.github/prompts/**`, and `.github/copilot-instructions.md`. Do not generate findings for these paths even if they appear in the diff; they are review configuration, not application code.

### 2. Common Checks

#### Repository Basics

- README exists and includes Purpose, Getting Started, Environment Variables, Testing, and Deployment.
- Language/runtime version is declared in `.node-version`, `.python-version`, `.tool-versions`, or `.go-version`.
- Dependencies are locked with `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `poetry.lock`, or `go.sum`.
- Dependency update automation exists through `.github/dependabot.yml` or `renovate.json`.

#### Linting and Formatting

- A linter is configured and enforced in CI.
- A formatter is configured and enforced in CI or through pre-commit hooks.
- CI includes lint and format checks.

#### Git and Tests

- Check the Conventional Commits compliance ratio across the latest 10 commits when history is available.
- Check branch protection and required reviews when repository permissions and metadata are available.
- Test files or a test directory exist.
- CI executes tests.
- A coverage threshold is configured.

### 3. Layer-Specific Checks

Apply the matching section of `.github/docs/coding-guidelines.md`:

- Frontend: ESLint, Prettier, TypeScript strictness, accessibility checks, i18n, and unit/component/integration test coverage (defer full E2E to SIT/UAT).
- API gateway: infrastructure-as-code route definitions, authentication, authorization, rate limiting, validation, OpenTelemetry, and correlated access logs.
- Backend microservice: language-standard linting and formatting, API versioning, error schemas, data ownership, migrations, parameterized queries, structured logging, OpenTelemetry, audit logs, and unit/integration/contract tests.

#### Mechanical Checks

Perform these explicit checks:

- **TypeScript `any` usage**: Search for `: any` patterns in `.ts` and `.tsx` files; report if found.
- **Hardcoded UI strings**: Search for string literals not using the i18n framework in frontend components; report if found.
- **SQL string concatenation**: Search for `SELECT.*\+`, `.format("SELECT`, or similar in backend code; report if found.
- **Structured logging**: Verify logger outputs include `timestamp`, `level`, `service`, `trace_id`, `span_id`, `message` (JSON format).
- **OpenTelemetry**: Check for `@opentelemetry/sdk-*` dependencies and initialization code in `package.json` and application entry point.
- **Hardcoded secrets**: Scan for common secret patterns (AWS keys, API keys, DB passwords) using regex or gitleaks-like detection.
- **Standard authentication**: Verify use of OAuth/OIDC libraries, not custom authentication implementations.
- **Coverage threshold**: Check `vitest.config.ts`, `jest.config.js`, `pyproject.toml`, or equivalent for coverage thresholds.

### 4. PII and Privacy Compliance

Apply `.github/docs/PII_code_compliance_review_checklist.md` to any changed code that collects, displays, stores, transmits, or logs passenger, companion, payment, or other personal data. Report gaps such as missing field classification, unnecessary data collection, preselected consent, or unsafe logging of PII.

### 5. Security and CI/CD

Check the following across layers:

- No secrets are committed.
- Secret-containing files are ignored and a safe `.env.example` or equivalent template exists.
- Dependency vulnerability scanning is configured in CI.
- CI covers dependency installation, lint, format check, type check, tests, build, and security scanning where applicable.
- Production deployment has an approval gate and environments are separated.
- Container images are scanned and production artifacts do not contain source-control metadata.

## Report Output

### Report Format

Write one flat report under `tmp/reviews/`:

```text
tmp/reviews/YYYYMMDD-HHMMSS_development_<scope>.md
```

- `<scope>` is `PR-<number>` in PR mode (e.g., `PR-42`).
- `<scope>` is the repository name in repository mode (e.g., `nexuz-frontend`).
- Use the local timestamp with seconds precision.
- Create the directory if it does not exist.

### Report Structure

```markdown
# Development Deliverable Review - <repository> <main|PR #N>

| Item | Details |
|------|----------|
| Review Date/Time | YYYY/MM/DD HH:MM:SS |
| Reviewer | <username> |
| Mode | local repo / PR |
| Target | <repository URL> (branch or PR) |
| Target SHA | <commit SHA> |
| Detected Layer | frontend / api-gateway / backend |
| Guideline Reference | `.github/docs/coding-guidelines.md` |
| Checklist Reference | `.github/docs/development-checklist.md` |
| PII Reference | `.github/docs/PII_code_compliance_review_checklist.md` |
| Overall Result | OK / NG (Critical X, Major Y, Minor Z) |

## Section 2: Common Checks

### 2.1 Repository Basics
- [OK/NG] <check result and evidence>

### 2.2 Linting and Formatting
- [OK/NG] <check result and evidence>

### 2.3 Git and Tests
- [OK/NG] <check result and evidence>

## Section <Layer>: Layer-Specific Checks

### Mechanical Checks
- [OK/NG] TypeScript `any` usage: <result>
- [OK/NG] Hardcoded UI strings: <result>
- [OK/NG] SQL string concatenation: <result>
- [OK/NG] Structured logging: <result>
- [OK/NG] OpenTelemetry integration: <result>
- [OK/NG] Hardcoded secrets: <result>

## Section 4: PII and Privacy Compliance
- [OK/NG] <check result and evidence>

## Section 6: Security
- [OK/NG] <check result and evidence>

## Section 7: CI/CD
- [OK/NG] <check result and evidence>

## Findings

| # | Severity | Rule | path:line | Detail | Recommended Action |
|---|----------|------|-----------|--------|--------------------|
| 1 | Critical | 6.1 | src/config.ts:12 | API key hardcoded | Move to environment variable |

## Notes

<Semantic observations, assumptions, and unavailable checks>
```

### Severity Criteria

| Severity | Criteria | Examples |
|----------|----------|----------|
| **Critical** | Security violations, missing mandatory CI checks, no production approval gate | Hardcoded secrets, SQL injection risk, disabled TLS, missing lint/test in CI |
| **Major** | Major guideline violations affecting code quality or compliance | Missing OpenTelemetry, missing structured logging, <50% test coverage, extensive `any` usage |
| **Minor** | README omissions, minor commit convention issues, recommendation-level improvements | Missing ownership section, inconsistent commit messages, code style suggestions |

### Final Output Behavior

1. Write the report to the file path above.
2. Do not publish report contents to GitHub (no PR comments, no review submissions).
3. After writing the report, display the full path and a summary of findings for the user.
4. Ask the user to review the report and provide confirmation that the review is complete.

Example confirmation message:
```
Review complete: tmp/reviews/20260907-143045_development_nexuz-frontend.md
Findings: 3 Critical, 2 Major, 5 Minor
Next: Please review the report and confirm completion.
```

## Next.js and Frontend Rules

Apply the rules below to changed Next.js frontend files in addition to the development checklist.

### L1-001: Use Alias Imports
Use `@` alias imports instead of relative imports.

### L1-002: Use Tailwind Design Tokens
Use shared Tailwind design tokens instead of hardcoded colors, font sizes, spacing, padding, margins, or gaps.

### L1-003: Use Translation Keys
Route all user-facing text through the i18n framework.

### L1-004: Check File and Folder Structure
Keep file names and folders consistent with the established feature/module organization.

### L1-005: Move Types to Shared Types Folder
Move reusable types and interfaces to the designated `types` folder. Keep truly local types near their component.

### L1-006: Use JSDoc for Functions
Add JSDoc for functions when the purpose, parameters, or return value is not self-evident.

### L1-007: Common Components Clean Up Default Props
Remove default props that duplicate sensible defaults already defined by common components.

### L1-008: Keep Shared UI Components Focused
Keep common component APIs minimal and avoid one-off wrapper props or special cases.

### L1-009: Mark Client Components
Components using hooks, event handlers, or browser APIs must include `'use client'`.

### L1-010: Use Next Image
Use `next/image` instead of HTML `<img>` for application images.

### L1-011: Use Next Link
Use `next/link` instead of HTML `<a>` for internal navigation.

### L1-012: Environment Variable Naming
Browser-visible variables must use the `NEXT_PUBLIC_` prefix. Server-only secrets must not use it.

### L1-013: Avoid Client-Only Code in Server Context
Keep `window`, `localStorage`, `document`, and other browser APIs in client components or client hooks.

### L1-014: Use Dynamic Imports for Heavy Components
Use `next/dynamic` for heavy client components when code splitting is beneficial.

### L2-001: Move Logic to the Appropriate Module Layer
Move reusable hooks, services, constants, helpers, validation, and data transformations out of components into the matching module.

### L2-002: Move Data Transformation Out of Components
Move reused or complex mapping, derived data, and formatting into hooks, helpers, or view-model modules.

### L2-003: Server and Client Component Architecture
Prefer server components for data fetching, secrets, and direct database access. Use client components only for required interactivity and avoid passing unnecessarily large data structures.

### L2-004: API Route Organization
Organize API routes by feature under `/app/api/[feature]/`, define request/response types, and centralize authentication, validation, and error handling where reusable.

### L2-005: Data Fetching and Cache Management
Prefer server-side `fetch()` with explicit cache behavior over client-side `useEffect` fetching when the data does not require client-only behavior.

### L2-006: Route Organization and Layout Nesting
Use nested layouts and route groups for shared navigation, providers, and authentication wrappers.

### L2-007: Use the Metadata API
Use static `Metadata` exports or `generateMetadata()` instead of hardcoded meta tags. Add `robots`, Open Graph, and structured data when relevant.

## Finding Format

For each violation, write one short, action-oriented finding using:

```text
[Severity] [Rule Name]: [What is wrong] in [file/component]. Please [action].
```

Example:
```text
[Minor] L1-001 Use Alias Imports: Relative import used instead of @ alias in components/BookingForm.tsx. Please use the @ alias.
```
