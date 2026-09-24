# Pull Request Summary

Use this template after creating a PR. Fill all sections with reviewer-friendly details.
If a section is not applicable, write: N/A.

## Pull Request Description
Provide a clear summary of:
- Purpose of this PR
- Business requirement
- Implementation details
- Scope
- Expected outcome

Template:
- Purpose:
- Business requirement:
- Implementation details:
- Scope:
- Expected outcome:

## Linked Jira Tickets
List all related Jira tickets.

Template:
- Story:
- Bug:
- Task:
- Spike:
- Epic:


## Type of Change
Select all applicable items and add a brief explanation.

- [ ] Feature
  - Explanation:
- [ ] Bug Fix
  - Explanation:
- [ ] UX Enhancement
  - Explanation:
- [ ] Refactor
  - Explanation:
- [ ] Setup / Configuration
  - Explanation:
- [ ] Accessibility
  - Explanation:
- [ ] Performance
  - Explanation:
- [ ] Technical Debt
  - Explanation:
- [ ] CI/CD
  - Explanation:

## Applications Changed
Mention impacted areas and describe what changed in each.

- [ ] Apps (UI / UX)
  - [ ] IBE
    - Details:
  - [ ] TOP
    - Details:
  - [ ] Prismic
    - Details:
- [ ] Packages
  - Details:
- [ ] CI/CD
  - Details:
- [ ] Shared Components
  - Details:
- [ ] Documentation
  - Details:

## Affected Packages
List modified packages/modules and summarize updates.

Template:
- Package/Module:
  - Change summary:
- Package/Module:
  - Change summary:

## Local Validation Status
Provide current status and evidence links/screenshots if available.

Template:
- pnpm run lint: Pass / Fail / Not Run
- Biome: Pass / Fail / Not Run
- Lefthook: Pass / Fail / Not Run
- Type Check: Pass / Fail / Not Run
- Build Validation: Pass / Fail / Not Run
- Screenshot references:

## Checklist Verification
Confirm verification status.

- [ ] Self-review completed
- [ ] Coding standards followed
- [ ] Error handling implemented
- [ ] Logging added where required
- [ ] Tested locally
- [ ] No sensitive data introduced

Overall Checklist Verified: Yes / No

## Translation Labels
Specify translation impact.

Template:
- Local Translation Files: Updated / Not Updated / N/A
- Prismic Labels: Updated / Not Updated / N/A
- No Translation Changes: Yes / No
- New or updated translation keys:

## Accessibility Validation (WCAG)
Provide validation status and findings.

Template:
- WCAG Compliance: Pass / Fail / Not Run / N/A
- IGT Validation: Pass / Fail / Not Run / N/A
- Keyboard Navigation: Pass / Fail / Not Run / N/A
- NVDA Screen Reader Testing: Pass / Fail / Not Run / N/A
- Color Contrast Validation: Pass / Fail / Not Run / N/A
- Focus Order Validation: Pass / Fail / Not Run / N/A
- Semantic HTML Validation: Pass / Fail / Not Run / N/A
- Accessibility findings:
- Screenshot/report references:

## Unit Testing Status
Provide unit testing and coverage details.

Template:
- Vitest Coverage: Covered / Not Covered
- Existing Tests Passing: Yes / No / N/A
- Coverage Impact: Increased / Decreased / No Change / N/A
- UTC Document Attached: Yes / No
- UTR Document Attached: Yes / No
- Coverage Report Attached: Yes / No

## Screenshots / UI Validation
Attach or link UI validation evidence.

Template:
- Before Screenshots:
- After Screenshots:
- Demo Video / Recording Link:

## API Impact
Specify API change type and compatibility notes.

Template:
- [ ] No API Changes
- [ ] New Endpoint Added
- [ ] Request Contract Changed
- [ ] Response Contract Changed
- API impact details:
- Backward compatibility considerations:

## Performance Impact
Provide measurable performance impact details.

Template:
- Bundle Size Impact:
- Performance Testing Results:
- Lighthouse Scores:
- Optimization implemented:

## Deployment / Release Notes
Provide release and rollback details.

Template:
- Feature Flag Details:
- Environment Validation (Local/DEV/QA/UAT):
- Rollback Strategy:
- Deployment Considerations:

## Risks and Dependencies
Document known risks and mitigation.

Template:
- Known Risks:
- External Dependencies:
- Potential Impact Areas:
- Mitigation Plan:

## TO-DO / Follow-Up Items
List items intentionally excluded from this PR and planned for future PRs.

Template:
- [ ] Follow-up item 1
- [ ] Follow-up item 2

## Reviewer Notes
Include areas requiring special attention, testing instructions, and validation steps.

Template:
- Focus areas for review:
- How to validate locally:
- Additional notes:

 