# Nexu-Z Coding Guidelines

## 1. Scope and Purpose

This document defines the coding standards and development practices for the Nexu-Z project. It covers all application layers — frontend, API gateway,  — and specifies the tooling, security practices, and CI requirements that all contributors must follow.

This document implements the following governance principles and rules:

- Principle §2.2.3.2 — Code should follow best practices for the language it's implemented in
- Principle §2.2.3.3 — Defects should be caught as soon in the development process as possible
- Rule 2.2.3.1 — Source code commits must follow git convention
- Rule 2.2.3.2 — Standard linters and other static analysis should be enabled
- Rule 2.2.3.3 — Verifiable builds and deployment through a CI/CD pipeline

Deviations from any guideline in this document require an ADR with justification.

---

## 2. General Standards (All Layers)

### 2.1 Language and Runtime

**Guideline 2.1.1** — Each repository must declare its language version and runtime in a version file (e.g., `.node-version`, `.python-version`, `.tool-versions`).

**Guideline 2.1.2** — Dependencies must be locked (e.g., `package-lock.json`, `yarn.lock`, `poetry.lock`). Lock files must be committed to version control.

**Guideline 2.1.3** — Dependency vulnerability monitoring should be automated (e.g., Dependabot, Renovate, Snyk). Automated tools must generate reports or suggestions only — they must not automatically apply source code changes. Reports must be reviewed before any updates are merged.

### 2.2 Linting and Formatting

**Guideline 2.2.1** — Every repository must have a linter configured and enforced in CI. Linter configuration files must be committed to version control.
*Implements: Rule 2.2.3.2*

**Guideline 2.2.2** — Every repository must have a code formatter configured. Formatting must be enforced in CI (format check) or via pre-commit hooks.
*Implements: Rule 2.2.3.2*

**Guideline 2.2.3** — Linter and formatter configurations should be shared across repositories of the same layer where possible, to maintain consistency.

### 2.3 Repository README

**Guideline 2.3.1** — Each repository must have a README.md at the root that includes:
- **Purpose**: What the service does and its domain context
- **Architecture**: High-level overview and key design decisions
- **Getting Started**: Prerequisites, installation, and local development setup
- **Environment Variables**: All required configuration with descriptions (never include actual secrets)
- **API Overview**: Summary of endpoints or interfaces exposed (link to OpenAPI spec if applicable)
- **Testing**: How to run tests locally
- **Deployment**: How the service is deployed (link to runbook if applicable)
- **Ownership**: Team or individual responsible

*Implements: Rule 2.1.1.3*

**Guideline 2.3.2** — README content must be kept up to date. Outdated documentation is worse than no documentation.

### 2.4 Git Conventions

**Guideline 2.4.1** — Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/) format:
```
<type>(<scope>): <description>

[optional body]
[optional footer(s)]
```
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `build`
*Implements: Rule 2.2.3.1*

**Guideline 2.4.2** — Each commit should represent a single logical change. Avoid mixing unrelated changes in one commit.
*Implements: Rule 2.2.3.1*

**Guideline 2.4.3** — All changes must go through a Pull Request. Direct pushes to `main` / `develop` are prohibited.

**Guideline 2.4.4** — Pull Requests must be reviewed and approved by at least one other developer before merging.

### 2.5 Testing

**Guideline 2.5.1** — Every repository must have automated tests. Minimum coverage thresholds should be defined per repository and enforced in CI.
*Implements: Rule 2.2.3.3*

**Guideline 2.5.2** — Tests must be deterministic. Flaky tests must be fixed or quarantined promptly.

**Guideline 2.5.3** — Test naming should clearly describe the scenario being tested (e.g., `should return 404 when booking not found`).

---

## 3. Frontend

### 3.1 Linting and Formatting

**Guideline 3.1.1** — Use [ESLint](https://eslint.org/) for static analysis with a shared configuration.

**Guideline 3.1.2** — Use [Prettier](https://prettier.io/) for code formatting. Prettier and ESLint configurations must not conflict.

**Guideline 3.1.3** — Use [Stylelint](https://stylelint.io/) for CSS/SCSS linting (if applicable).

### 3.2 Type Safety

**Guideline 3.2.1** — TypeScript must be used. `strict` mode must be enabled in `tsconfig.json`.

**Guideline 3.2.2** — Avoid `any` type. Use `unknown` where the type is genuinely not known, with proper narrowing.

### 3.3 Accessibility

**Guideline 3.3.1** — All UI components must meet WCAG 2.2 Level AA compliance.

**Guideline 3.3.2** — Automated accessibility checks (e.g., `eslint-plugin-jsx-a11y`, axe-core) must be included in CI.

### 3.4 Internationalization

**Guideline 3.4.1** — All user-facing text must go through the internationalization (i18n) framework. Hard-coded strings in UI code are prohibited.

**Guideline 3.4.2** — Translation keys should be organized by feature or page, not in a single flat namespace.

### 3.5 Testing

**Guideline 3.5.1** — Unit tests for business logic and utility functions.

**Guideline 3.5.2** — Component tests for UI components with interaction testing.

**Guideline 3.5.3** — End-to-end tests for critical user flows (booking, payment, post-booking modifications).

---

## 4. API Gateway

### 4.1 Configuration

**Guideline 4.1.1** — API gateway configuration must be defined as code (e.g., OpenAPI spec, CDK constructs, Terraform).

**Guideline 4.1.2** — Route definitions, rate limits, and CORS policies must be version-controlled.

### 4.2 Security

**Guideline 4.2.1** — Authentication and authorization must be enforced at the gateway level. Backend services should not be directly accessible from the public internet.

**Guideline 4.2.2** — Rate limiting must be configured per endpoint based on expected traffic patterns.

**Guideline 4.2.3** — Request validation (schema validation) should be performed at the gateway or at the API level using HTTP request interceptors to reject malformed requests early.

### 4.3 Observability

**Guideline 4.3.1** — [OpenTelemetry](https://opentelemetry.io/) must be adopted as the standard instrumentation framework for traces, metrics, and logs across all layers (gateway, backend microservices, and any intermediate components).
*Implements: Rule 2.2.1.5*

**Guideline 4.3.2** — The API gateway must initiate an OpenTelemetry trace (root span) for every inbound request and propagate the trace context (W3C Trace Context) to all downstream services. This ensures end-to-end trace collection from gateway through every microservice in the call chain.
*Implements: Rule 2.2.1.5*

**Guideline 4.3.3** — Access logs must be enabled with request/response metadata (method, path, status, latency) and correlated with the trace ID.

## 6. Security

### 6.1 Secrets Management

**Guideline 6.1.1** — Secrets (API keys, database credentials, tokens) must never be committed to version control. Use a secrets manager (e.g., AWS Secrets Manager, Parameter Store).

**Guideline 6.1.2** — Configuration files containing secrets (e.g., `.env`, `application.properties`, `application.yml`) must be listed in `.gitignore`. Template files with dummy/placeholder values (e.g., `.env.example`, `application.properties.example`) should be committed instead. Actual secret values must be fetched from the secrets manager at runtime. For local development, actual values may be used but must never be committed to version control.

**Guideline 6.1.3** — AWS resource credentials must be rotated on a defined schedule and immediately upon suspected compromise. External system credentials that do not support rotation (e.g., third-party API credentials) are exempt, but must be documented. Rotation frequency should be determined in consultation with the Security team.

**Guideline 6.1.4** — Secrets, API keys, passwords, and cryptographic keys must never be hardcoded in source code. They must be retrieved at runtime from the secrets manager.
*Implements: Rule 2.2.3.2; DevSecOps Procedures §Miscellaneous Requirements*

### 6.2 Dependency Security

**Guideline 6.2.1** — Automated dependency vulnerability scanning (e.g., `npm audit`, Snyk, Trivy) must be configured in CI.
*Implements: Rule 2.2.3.3*

**Guideline 6.2.2** — Critical and high-severity vulnerabilities must be resolved before merging to `main`.
*Implements: Rule 2.2.3.3; DevSecOps Procedures §Vulnerability Classification & Prioritization*

**Guideline 6.2.3** — Container images must be scanned for vulnerabilities before deployment.
*Implements: Rule 2.2.3.2; DevSecOps Procedures §System Configuration for Container*

### 6.3 Input Validation

**Guideline 6.3.1** — All external input (user input, API requests, webhook payloads) must be validated and sanitized at the system boundary.

**Guideline 6.3.2** — Use an allowlist approach for input validation where possible, rather than a denylist.

### 6.4 Authentication and Authorization

**Guideline 6.4.1** — Use industry-standard protocols (OAuth 2.0 / OIDC) for authentication. Do not implement custom authentication schemes.

**Guideline 6.4.2** — Authorization checks must be enforced at the service level, not solely at the gateway.

**Guideline 6.4.3** — Follow the principle of least privilege for service-to-service communication (IAM roles, scoped tokens).

### 6.5 Data Protection

**Guideline 6.5.1** — All data in transit must use TLS 1.2 or higher.

**Guideline 6.5.2** — Sensitive data at rest must be encrypted using customer-managed keys (CMK) in AWS KMS.

**Guideline 6.5.3** — PII handling must comply with the requirements defined in `.github\docs\PII_code_compliance_review_checklist.md`.

---

## 7. CI/CD Pipeline

### 7.1 Pipeline Structure

**Guideline 7.1.1** — Every repository must have a CI pipeline that runs on every Pull Request. The pipeline must include at minimum:
1. Dependency installation
2. Lint check
3. Format check
4. Type check (where applicable)
5. Automated tests
6. Build verification

*Implements: Rule 2.2.3.3*

**Guideline 7.1.2** — CI pipelines must be defined as code (e.g., GitHub Actions workflows) and version-controlled in the same repository.

**Guideline 7.1.3** — CI must complete within a reasonable time (target: under 10 minutes for PR checks). Long-running tests (e2e, performance) may run on a separate schedule.

### 7.2 Build and Deploy

**Guideline 7.2.1** — Builds must be reproducible. Given the same commit, the build output must be identical.

**Guideline 7.2.2** — Artifacts (container images, bundles) must be tagged with the git commit SHA for traceability.

**Guideline 7.2.3** — Deployment to all environments, including production, must go through the same CI/CD pipeline, differentiated only by environment variables. Production deployments must include manual approval gates within the pipeline.
*Implements: Rule 2.2.2.4*

**Guideline 7.2.4** — Build artifacts and container images must be digitally signed. Downstream consumers must verify signatures before deployment.
*Implements: Rule 2.2.3.3; DevSecOps Standard §3.5.2; DevSecOps Procedures §CI/CD*

**Guideline 7.2.5** — Production build artifacts and container images must not contain `.git` directories or source control metadata.
*Implements: DevSecOps Procedures §Miscellaneous Requirements*

### 7.3 Quality Gates

**Guideline 7.3.1** — PRs must not be mergeable if CI fails (branch protection).

**Guideline 7.3.2** — Security scanning results must be reviewed before deployment to staging or production.

**Guideline 7.3.3** — Deployment to production requires a formal Change Request (CRQ) submitted and approved prior to the change. The CRQ must include a summary of test results, security scan outcomes, and a rollback plan. At least one authorized reviewer must approve before deployment proceeds.
*Implements: Rule 2.2.2.4; DevSecOps Procedures §S-SDLC Stage 5*

### 7.4 Environment Separation

**Guideline 7.4.1** — Development (DEV), staging (STG), and UAT environments must be strictly separated from production (PROD). Network controls must enforce this separation if any development environment has connectivity to production networks.
*Implements: Rule 2.2.2.4; Rule 2.2.2.6; DevSecOps Procedures §Development Environment*

**Guideline 7.4.2** — Live cardholder data (PANs) must never be used in pre-production environments.
*Implements: DevSecOps Procedures §Development Environment*

**Guideline 7.4.3** — All test data, test accounts, and temporary credentials must be removed before software is activated in production.
*Implements: DevSecOps Procedures §Development Environment*

**Guideline 7.4.4** — Debugging infrastructure intended only for non-production use (e.g., bastion servers) must be removed or disabled before production deployment.
*Implements: DevSecOps Procedures §S-SDLC Stage 3*


