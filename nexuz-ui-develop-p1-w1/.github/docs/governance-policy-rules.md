# Nexu-Z Governance Principles

## 1. Scope and Purpose

This document establishes the guiding principles for governance of the Nexu-Z (New IBE) project. Each principle includes a description of why the principle exists.

This document is one of three that together form the project's governance framework:

- **Principles** (this document) — the *why*
- **Rules** — the operational requirements derived from these principles
- **Deliverables** — the artifacts the vendor produces to demonstrate compliance with the rules

Each rule cites the principle it implements. Each deliverable cites the rules it satisfies.

## 2. Principles

### 2.1 Governance

#### 2.1.1 Documentation

**§2.1.1.1 — Documentation should be searchable and have a history**

A complete searchable history of the text of all documents makes it easier to find documentation and see changes over time, which can help solve discrepancies and remove ambiguity.

**§2.1.1.2 — The decision-making process must be documented**

Recording every change provides context for decisions that otherwise get lost, and allow for seeing discrepancies when questions come up.

**§2.1.1.3 — All services are documented independently**

Per-service documentation gives the context and boundaries for each service, so it can be worked on independently and treated as a black box by other services.

**§2.1.1.4 — Justifications should live within each document**

Traceability allows for the framework to function by connecting deliverables back to the principles from which they are derived.

#### 2.1.2 Quality Control

**§2.1.2.1 — Quality and standards for development must be maintained regardless of who is working on or verifying the process**

On both the development and verification steps, members may change at any time, and a consistent standard ensures that quality of the product will not be affected.

### 2.2 Architecture and Code Quality

#### 2.2.1 Design Principles and Service Architecture

**§2.2.1.1 — Services should be separated by logical business domains**

To fit with ZIPAIR's strategy of modular services that can be utilized independently, this allows change within business domains to be isolated from the other services.

**§2.2.1.2 — Data ownership must be explicit and controlled**

Shared data couples both deployment and database migrations, and creates ambiguity about which system is the owner of what data.

**§2.2.1.3 — Data transfer must be explicit and documented**

Boundaries between services need to be clearly defined with explicit interfaces to mesh together as one cohesive application even though the parts are separate.

**§2.2.1.4 — Incidents and degradations should be able to be diagnosed as soon as they happen**

If an incident occurs, the information needed to diagnose it should already be captured.

#### 2.2.2 Infrastructure Strategy

**§2.2.2.1 — Prefer reliable and proven architecture strategies**

AWS Well-Architected Framework is a proven methodology that requires justification to deviate from.

**§2.2.2.2 — Prefer higher levels of abstraction**

AWS managed services should be preferred over non-managed counterparts, this leverages the strengths of AWS and reduces complexity.

**§2.2.2.3 — Deployments should be repeatable and codified as IaC (Infrastructure as Code)**

Auditable deployments via IaC can be verified before being executed, and rollback is as simple as redeploying a previous version.

**§2.2.2.4 — Deployment procedures should be environment independent**

A deployment to a development or UAT server should also act as a practice run for a production deployment, to take as many variables out on deployment day as possible.

#### 2.2.3 Development and Operations Policy

**§2.2.3.1 — Code must be easily auditable**

All code should be version-controlled with logical commits.

**§2.2.3.2 — Code should follow best practices for the language that it's implemented in**

No reason to reinvent the wheel; following standards makes future development easier.

**§2.2.3.3 — Defects should be caught as soon in the development process as possible**

Defects caught in the CI phase reduce overhead.

# Nexu-Z Governance Rules

## 1. Scope and Purpose

This document specifies the operational rules that implement the principles laid out in Nexu-Z Governance Principles. Each rule cites the principle it derives from. Where a rule cannot be traced to a principle, either the rule is out of scope or the principles document has a gap — both are actionable.

Rules describe *what must be true of the work*. The medium through which the vendor demonstrates each rule is being followed is captured in [Nexu-Z Deliverables](nexu-z-deliverables.md).

Deviations from any rule in this document are handled as ADRs: justified in writing, time-bounded or explicitly permanent, and reviewed before implementation proceeds.

## 2. Rules

### 2.1 Governance

#### 2.1.1 Documentation Rules

**Rule 2.1.1.1** — Documentation, code, and infrastructure-related documentation should be text-based where possible and recorded in version control.
*Implements: Principle §2.1.1.1*

**Rule 2.1.1.2** — All meaningful decisions are recorded as ADRs.
*Implements: Principle §2.1.1.2*

**Rule 2.1.1.3** — Each service must have a self-contained README that describes its purpose, ownership, and operational characteristics.
*Implements: Principle §2.1.1.3*

**Rule 2.1.1.4** — Each service must publish an OpenAPI specification for its public interfaces.
*Implements: Principle §2.1.1.3*

**Rule 2.1.1.5** — Each service must have an entry in the service catalog.
*Implements: Principle §2.1.1.3*

**Rule 2.1.1.6** — Documentation should reference the principles, rules, and decisions it implements or depends on.
*Implements: Principle §2.1.1.4*

#### 2.1.2 Quality Control Rules

**Rule 2.1.2.1** — Every process for verifying deliverables needs to be documented.
*Implements: Principle §2.1.2.1*

**Rule 2.1.2.2** — Each service must have an operational runbook covering routine procedures, known failure modes, and recovery steps.
*Implements: Principle §2.1.2.1*

### 2.2 Architecture and Code Quality

#### 2.2.1 Design and Service Architecture Rules

**Rule 2.2.1.1** — Service boundaries need to be explicitly designated.
*Implements: Principle §2.2.1.1*

**Rule 2.2.1.2** — All data storage within a service must be documented (entities, ownership, and relationships).
*Implements: Principle §2.2.1.2*

**Rule 2.2.1.3** — All data flows between services must be documented.
*Implements: Principle §2.2.1.2*

**Rule 2.2.1.4** — API contracts must be explicitly defined.
*Implements: Principle §2.2.1.3*

**Rule 2.2.1.5** — Logs, metrics, and traces should be in every system.
*Implements: Principle §2.2.1.4*

#### 2.2.2 Infrastructure Rules

**Rule 2.2.2.1** — All infrastructure should adhere to the AWS Well-Architected Framework unless there is a reason to do otherwise.
*Implements: Principle §2.2.2.1*

**Rule 2.2.2.2** — All technology choices must be reflected in the Tech Radar, with rationale for adoption, trial, hold, or assess status.
*Implements: Principle §2.2.2.1*

**Rule 2.2.2.3** — No non-managed systems without an ADR and approval.
*Implements: Principle §2.2.2.2*

**Rule 2.2.2.4** — No manual processes in cloud deployment or configuration.
*Implements: Principle §2.2.2.3*

**Rule 2.2.2.5** — All infrastructure provisioning must be defined in Infrastructure as Code.
*Implements: Principle §2.2.2.3*

**Rule 2.2.2.6** — One IaC repo with variables per environment.
*Implements: Principle §2.2.2.4*

#### 2.2.3 Development and Operations Rules

**Rule 2.2.3.1** — Source code commits must follow git convention.
*Implements: Principle §2.2.3.1*

**Rule 2.2.3.2** — Standard linters and other static analysis should be enabled.
*Implements: Principle §2.2.3.2*

**Rule 2.2.3.3** — Verifiable builds and deployment to all systems happens through a CI/CD pipeline that runs automated tests.
*Implements: Principle §2.2.3.3*
