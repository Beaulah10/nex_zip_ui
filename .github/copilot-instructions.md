## PR Review Agent

When reviewing a pull request in this repository (including automated GitHub PR reviews), you MUST:

1. Load and follow ".github/skills/code-review/SKILL.md" in full — it defines the review workflow, checks, and report format.
2. Explicitly read and apply every file under `.github/docs/` as mandatory review references, not just the skill file itself:
   - `.github/docs/development-checklist.md` — primary sprint-level workflow.
   - `.github/docs/coding-guidelines.md` — detailed compliance reference; Next.js Level 1 and Level 2 rules are defined in `.github/skills/code-review/SKILL.md`.
   - `.github/docs/governance-policy-rules.md` — governance traceability for findings.
   - `.github/docs/PII_code_compliance_review_checklist.md` — PII/privacy compliance checks (GDPR, PIPA, CCPA, COPPA, ePrivacy, CAN-SPAM, Japanese e-commerce laws, airline regulations).
3. Do not skip any of the four docs above even if only the skill file is discoverable — treat this list as the source of truth for which references are mandatory.
4. Check all Level 1 and Level 2 rules for Next.js code quality, and all PII compliance items, before concluding a review.
5. Do not review, flag, or report on changes made inside `.github/skills/**`, `.github/agents/**`, `.github/docs/**`, `.github/prompts/**`, or `.github/copilot-instructions.md` itself. These paths are review configuration, not application code, and are always out of scope for findings — even when they appear in the PR diff.
