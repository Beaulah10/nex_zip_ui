# Development Review Checklist

Review checklist for ZIPAIR to verify TCS sprint deliverables.
This checklist covers the minimum verification items at sprint completion. Detailed edge-case testing and end-to-end validation are deferred to SIT / UAT.

See the following for related references:

- [`coding-guidelines.md`](coding-guidelines.md) — Coding standards and development practices

---

## 1. Common Checks ( Frontend)

### 1.1 Repository Basics

- [ ] README.md exists and includes: Purpose, Getting Started, Environment Variables, Testing, and Deployment sections — *Guideline 2.3.1*
- [ ] Language version is declared in a version file (`.node-version`, `.tool-versions`, etc.) — *Guideline 2.1.1*
- [ ] Dependencies are locked (`package-lock.json`, `yarn.lock`, etc.) and committed — *Guideline 2.1.2*

### 1.2 Linting and Formatting

- [ ] Linter is configured, config file is committed, and CI enforces it — *Guideline 2.2.1*
- [ ] Formatter is configured and enforced in CI or pre-commit hooks — *Guideline 2.2.2*
- [ ] `mvn checkstyle:check` / `npm run lint` (or equivalent) passes with no errors

### 1.3 CI Pipeline

- [ ] CI pipeline exists and runs on every PR — *Guideline 7.1.1*
- [ ] Pipeline includes: dependency install → lint → format check → type check → tests → build — *Guideline 7.1.1*
- [ ] PR cannot be merged when CI fails (branch protection enabled) — *Guideline 7.3.1*

### 1.4 OpenTelemetry / Observability

- [ ] OpenTelemetry SDK is integrated for the applicable runtime — *Guideline 4.3.1, 5.4.4*
- [ ] Inbound requests generate a trace (root span) with W3C Trace Context propagation — *Guideline 4.3.2*
- [ ] Structured logging (JSON) includes `timestamp`, `level`, `service`, `trace_id`, `span_id`, `message` — *Guideline 5.4.1*
- [ ] Sensitive data (PII, credentials, payment data) does not appear in logs — *Guideline 5.4.3*

### 1.5 Security Basics

- [ ] No secrets (API keys, credentials, tokens) are committed to version control — *Guideline 6.1.1*
- [ ] Secret-containing config files are listed in `.gitignore`; `.env.example` (or equivalent template) is committed — *Guideline 6.1.2*
- [ ] Dependency vulnerability scan is configured in CI (`npm audit`, Snyk, Trivy, etc.) — *Guideline 6.2.1*

---

## 3. Frontend — Screen Verification

### 3.1 Design Conformance

- [ ] Implemented screens match the Visual Design (layout, spacing, colors) — *designs/visual-designs/*

### 3.2 Basic Functional Check

- [ ] Primary user flow for the sprint scope works end-to-end on screen (happy path)
- [ ] Screen transitions follow the specified navigation targets
- [ ] Loading states and error displays are controlled at the component level (with exceptions at the screen level where appropriate) (code-level verification only)

---

## 4. Items Deferred to SIT / UAT

The following are **out of scope** for sprint-level checks and will be verified in later testing phases:

- Edge-case and boundary-value testing
- End-to-end tests across frontend and backend
- Performance and load testing
- Security penetration testing
- Cross-browser / cross-device compatibility
- Full accessibility audit (WCAG 2.2 AA)
- Production deployment procedures (CRQ, rollback plan)
