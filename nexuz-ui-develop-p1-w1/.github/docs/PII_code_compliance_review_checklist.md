# PII Code Compliance Review Checklist

## Scope

This checklist covers application-code compliance requirements related to GDPR, PIPA, CCPA, COPPA, ePrivacy, CAN-SPAM, Japanese e-commerce laws, and airline regulations.

## 1. Identify and Classify All PII

Create an inventory of every field handled by the system, including:

- Passenger name, date of birth, nationality, and gender
- Email address, phone number, and postal/address information
- Account and membership information
- Booking, ticket, itinerary, payment, and transaction data
- Companion/passenger information entered by another person
- Child/minor information
- Accessibility or disability-related information
- Marketing preferences and consent records
- Cookies, device identifiers, IP addresses, tracking IDs, and online identifiers
- PNR, reservation IDs, loyalty IDs, and other indirectly identifying values

For every field, document:

- Collection purpose
- Legal basis
- Whether it is mandatory or optional
- Retention period
- Whether it is shared with a third party
- Whether it is transferred internationally
- Deletion or anonymization rules

**Relevant requirements:** `URQ-CMP-PRI-063`, `URQ-CMP-PRI-078`, `URQ-CMP-PRI-021`, `URQ-CMP-PRI-042`, and `URQ-CMP-PRI-065`.

## 2. Check Data Collection and Input Screens

Verify that:

- Only necessary PII is collected.
- Optional fields are clearly marked.
- Mandatory and optional processing are separated.
- Sensitive or unnecessary information is not requested.
- Passenger and companion data are clearly distinguished.
- Input validation prevents malformed or unauthorized data.
- Users can correct their information before submission.
- Data is not collected through hidden fields or unnecessary tracking.
- Consent checkboxes are not preselected.
- Pressing a booking or payment button does not implicitly mean consent to unrelated processing.

**Relevant requirements:** `URQ-CMP-PRI-012`, `URQ-CMP-PRI-042`, `URQ-CMP-PRI-043`, `URQ-CMP-PRI-065`, and `URQ-CMP-PRI-021`.

## 3. Check Consent Implementation

The code should verify that:

- Consent is explicit, informed, specific, and freely given.
- Privacy-policy consent and marketing consent are separate.
- Mandatory service processing is separated from optional marketing processing.
- Consent is not bundled with unrelated terms.
- Consent status, timestamp, purpose, version, source, and user/session identifier are stored.
- Consent withdrawal is supported.
- Withdrawal immediately stops the related processing.
- Consent history cannot be silently overwritten.
- Consent records are tamper-resistant and auditable.
- The system can prove what the user agreed to at a specific time.

**Relevant requirements:** `URQ-CMP-PRI-012`, `URQ-CMP-PRI-063`, `URQ-CMP-PRI-064`, `URQ-CMP-PRI-059`, `URQ-CMP-PRI-073`, and `URQ-CMP-PRI-074`.

## 4. Check Cookies and Tracking

### Before Consent Is Obtained

- Non-essential cookies must not be set.
- Analytics, advertising, profiling, and remarketing tags must not fire.
- Third-party SDKs must not transmit identifiers.
- Tag managers must start in a restrictive state.
- Consent status must be checked before every tracking action.
- Rejecting or closing the banner must not activate optional tracking.
- Essential cookies must be limited to genuine service/security needs.

### After Consent Withdrawal or Expiration

- Optional cookies should be removed or invalidated where possible.
- Existing tracking sessions must be stopped.
- Future tags and API calls must remain blocked.
- The consent banner should be shown again when consent expires.

**Relevant requirements:** `URQ-CMP-PRI-073` and `URQ-CMP-PRI-059`.

## 5. Check GPC and Browser Privacy Signals

For requests containing `Sec-GPC: 1`:

- The signal must be detected at middleware/backend level.
- Non-essential tracking must be disabled immediately.
- The application must not wait for the cookie banner decision.
- The signal must take priority over conflicting marketing preferences.
- The result must be stored in the consent manager/audit record.
- Downstream systems such as GTM, analytics, advertising, and profiling services must receive the opt-out state.

**Relevant requirement:** `URQ-CMP-PRI-064`.

## 6. Check Privacy Notices and Transparency

The application should provide notices explaining:

- What data is collected
- Why it is collected
- The legal basis
- Retention period
- Recipients and service providers
- International transfers
- User rights
- Contact or rights-request process
- Cookie and tracking purposes

For indirectly collected information, such as companion data entered by a booking representative:

- Identify that the data was not collected directly from the individual.
- Record the source.
- Explain the purpose of use.
- Include links to the privacy policy and rights-request pages.

**Relevant requirement:** `URQ-CMP-PRI-078`.

## 7. Check Data Storage and Database Design

Verify that:

- PII is encrypted in transit and at rest.
- Sensitive fields are not stored in plaintext unnecessarily.
- Production PII is not copied into logs, analytics, URLs, or error messages.
- Database backups and replicas follow the same retention and access rules.
- Metadata is associated with each PII field.
- Retention dates are machine-readable and enforceable.
- Deletion and anonymization work across all related tables and systems.
- Soft deletion does not leave PII accessible through APIs or search.
- Hashing is not treated as anonymization if the value can be reversed or linked.

The code should support the data dictionary and processing records required by `URQ-CMP-PRI-063`.

## 8. Check Retention and Automatic Deletion

Implement and test:

- Retention periods per data category and purpose.
- Automatic identification of expired data.
- Deletion or anonymization jobs.
- Dormant-account detection based on the defined inactivity period.
- Pre-deletion notification where required.
- Safe retry and failure handling for batch jobs.
- Deletion from primary databases, caches, search indexes, backups where applicable, and third-party systems.
- Audit logs showing what was deleted, when, why, and by which process.
- No deletion of records required for legal, tax, safety, or transaction obligations.

For dormant accounts, the requirements mention identifying accounts after a defined period, such as one year, and deleting or anonymizing associated PII.

**Relevant requirement:** `URQ-CMP-PRI-070`.

## 9. Check User Privacy Rights

The application should provide self-service or operational support for:

- Viewing stored personal information
- Correcting account and address information
- Deleting or withdrawing an account
- Requesting complete data removal
- Withdrawing marketing consent
- Requesting access or copies of data
- Restricting or objecting to processing where applicable

Deletion requests must trigger logical deletion or anonymization and must not be blocked by unnecessary retention UI.

**Relevant requirement:** `URQ-CMP-PRI-021`.

## 10. Check Access Control and Operational Security

Verify that:

- Access to PII follows least privilege.
- RBAC is applied to customer support, operations, administrators, batch jobs, and APIs.
- Deletion, export, and bulk-search permissions are restricted.
- Privileged operations require strong authentication.
- Service accounts have limited scopes.
- Access to PII is logged.
- Audit logs include actor, timestamp, target record, action, result, and reason.
- Audit logs cannot be edited or deleted by normal administrators.
- Logs do not expose the actual PII value.
- Failed authorization attempts are monitored.

This is specifically required for deletion/anonymization functions under `URQ-CMP-PRI-070` and for processing records under `URQ-CMP-PRI-063`.

## 11. Check Third-Party Sharing and External APIs

For every external integration:

- Confirm the purpose and legal basis for sharing.
- Send only the minimum required fields.
- Apply the user's consent and opt-out state before transmission.
- Prevent PII transmission to analytics or advertising tools without consent.
- Validate webhooks and callback authentication.
- Avoid placing PII in query strings.
- Encrypt API communication.
- Handle third-party deletion and opt-out requests.
- Record the transfer and response status.
- Check international-transfer safeguards.

This is important for payment providers, reservation systems, email platforms, CRM, analytics, advertising, tag managers, and customer-support tools.

## 12. Check Marketing and Email Processing

The code should verify that:

- Promotional emails are sent only to opted-in users.
- Unsubscribe links work without login friction.
- Unsubscribe requests immediately update the consent state where possible.
- Users are removed from distribution lists within the required period, including the stated 10-business-day requirement.
- Suppression lists are enforced across all campaigns and providers.
- Transactional and marketing emails are separated.
- Sender identity and contact information are displayed.
- Email addresses are not exposed to other recipients.
- Consent expiration stops future marketing.

**Relevant requirements:** `URQ-CMP-PRI-024`, `URQ-CMP-PRI-025`, `URQ-CMP-PRI-026`, and `URQ-CMP-PRI-061`.

## 13. Check Children and Parental Consent

For age-sensitive flows:

- Do not knowingly process children's data without the required safeguards.
- Apply age-screening rules where applicable.
- Require parent/guardian approval instead of ordinary user consent when required.
- Store proof of parental consent.
- Prevent marketing or profiling of minors where prohibited.
- Avoid collecting unnecessary child data.

**Relevant requirement:** `URQ-CMP-PRI-042`.

## 14. Check Payment and Optional-Service Consent

For optional services such as baggage, seats, insurance, or add-ons:

- Optional services must not be preselected.
- Prices and conditions must be clear.
- Consent or acceptance must be recorded.
- The system must distinguish mandatory booking data from optional service data.
- Adding an optional service must generate an auditable consent/selection flag.
- Removing the service must update the related state.

**Relevant requirements:** `URQ-CMP-PRI-017`, `URQ-CMP-PRI-043`, and `URQ-CMP-PRI-044`.

## 15. Required Test Scenarios

At minimum, test:

1. New user before any consent
2. Accept only essential cookies
3. Accept analytics but reject advertising
4. Reject all optional processing
5. Withdraw consent after acceptance
6. Expired consent
7. GPC-enabled browser request
8. Directly entered passenger data
9. Companion data entered by another person
10. Child/minor flow
11. Account information correction
12. Account deletion and anonymization
13. Dormant-account batch processing
14. Marketing unsubscribe
15. Unauthorized administrator access
16. Third-party API failure during deletion
17. Retry of partially completed deletion
18. Search, cache, backup, and log remnants after deletion
19. Audit-log immutability

## Important Gaps to Clarify

The documents contain unresolved or inconsistent points that should be confirmed during detailed design:

1. Exact retention periods
2. Exact dormant-account threshold
3. Whether consent-expiry reminders are allowed; one requirement says no email reminder, while another mentions reminders where necessary
4. Selected CMP and tag-management tools
5. Exact GPC scope and regional behavior
6. Which records must be retained for legal or accounting reasons
7. Whether deletion must include historical backups
8. Required international-transfer mechanisms

## Overall Code-Review Principle

> Collect the minimum PII, obtain provable consent, block processing by default, enforce retention and deletion automatically, restrict access, honor user rights, and leave an auditable trail without exposing the PII itself.
