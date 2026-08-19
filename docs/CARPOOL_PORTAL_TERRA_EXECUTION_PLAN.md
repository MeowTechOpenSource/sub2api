# Sub2API Carpool Portal: GPT-5.6 Terra Execution Plan

Status: implementation packet

Read first:

1. `docs/CARPOOL_PORTAL_PRODUCT_SPEC.md`
2. `docs/CARPOOL_PORTAL_ARCHITECTURE.md`
3. the current sub2api files cited in the architecture evidence section

This packet is written for a GPT-5.6 Terra / High implementation lane under a Sol architect. It describes the target system, not a request to modify the current dirty sub2api worktree immediately.

## Part 1: Objective And Required Outcome

Create a production-ready companion project that links to a configured sub2api instance and provides:

- sub2api-backed single sign-on without handling sub2api passwords;
- encrypted scoped sub2api portal-credential and nvtokens-cookie integrations;
- authenticated nvtokens Pro/K12 price and merchant-ranking sync;
- detection and atomic claiming of newly pushed, ungrouped paid ChatGPT subscription accounts only;
- durable purchase-price intake;
- private and public carpool requests, approval, account attachment, activation, and joining;
- isolated sub2api routing group and dedicated API-key assignment per carpool;
- usage ingestion and participant attribution while the account remains active;
- MAI usage ratios during activity, followed by purchase-principal allocation, 35% default unused-seat treatment, and 5% default service fee only after a system blocked/disabled event or canonical 7-day exhaustion;
- operator receivables, statements, payments, refunds, credits, and manual adjustments;
- admin dashboards, action queues, reconciliation, audit, settings, jobs, notifications, reports, and RBAC;
- a Vue interface matching the current redesigned sub2api visual system on desktop and mobile.

Completion means the full lifecycle works end to end with deterministic financial tests and no direct access to the sub2api database.

## Part 2: Context And Authoritative Contracts

### Current sub2api behavior

- Portal automation authenticates with a per-portal scoped bearer credential and cannot use the generic administrative credential.
- Ungrouped account filtering can be narrowed to `platform=openai&type=oauth&group=ungrouped`, and sub2api's `IsOpenAIChatGPTSubscription()` provides the paid ChatGPT eligibility rule.
- Account updates accept group IDs and scheduling changes.
- Admin usage exposes the IDs and cost fields needed for attribution.
- Admin API-key group updates exist.
- Canonical ChatGPT weekly state uses `codex_7d_used_percent`, `codex_7d_reset_at`, and `codex_usage_updated_at`.
- sub2api currently authenticates users but is not a provider for companion SSO.
- current page-based usage listing is insufficient as a proof of gap-free ingestion under concurrent writes.

### Chosen architecture

- Separate Git repository, PostgreSQL database, and deployment.
- Go API/worker plus Vue 3 SPA.
- HTTP integration only.
- Small, reviewed sub2api patch for scoped portal authentication, login ticket, ChatGPT-only atomic claim, bounded cursor usage feed, structured settlement-state events, a fail-closed terminal fence/drain watermark, and portal-owned membership provisioning.
- “Shared” is a portal category. Each carpool uses an isolated portal-owned remote group named `shared:<portal-client-id>:<carpool-public-id>`.
- Financial values are integer MAI minor units; rates and usage weights are fixed-precision decimals.
- Ledger is append-only. Admin “update balance” creates an adjustment.

### Supplier schema dependency

The linked nvtokens endpoints return `401 AUTH_REQUIRED` without the operator's cookie. Terra must not guess their successful response schema. Capture redacted authenticated fixtures before implementing normalizers.

## Part 3: Scope, Ownership, And Delivery Sequence

Implement in two repositories with explicit ownership:

- sub2api repository: only the six integration extensions, scoped portal-client bootstrap/authentication, frontend connect route, capability advertisement, additive migrations/tests, and documentation.
- new carpool portal repository: all portal domain, persistence, integrations, worker, API, SPA, deployment, and documentation.

Do not mix portal finance tables into the sub2api database. Do not refactor unrelated sub2api code. Preserve all concurrent/user edits and adapt to the current worktree.

### Phase 0: Contract Capture And Decision Freeze

Deliverables:

- successful redacted fixtures for both nvtokens endpoints using the operator-provided cookie;
- field dictionary covering units, timestamps, account type identifiers, merchant identifiers, nullability, availability, and paging;
- recorded redacted fixtures for all consumed existing sub2api endpoints;
- compatibility matrix for the current sub2api version/capabilities;
- confirmed MAI minor-unit precision and supplier-to-MAI conversion policy;
- confirmed terminal allocation policy: full recorded purchase principal per account lifecycle;
- frozen terminal-fence contract covering admission blocking, HTTP/SSE/WS request registration, drain through durable usage persistence, fail-closed degradation, immutable high-water capture, and bounded `through_id` ingestion;
- threat model and data classification.

Gate:

- no nvtokens normalizer code before fixtures exist;
- no financial migrations before currency precision and terminal lifecycle allocation policy are frozen.
- no Phase 3 integration interface implementation before the terminal-fence request/state schema, lifecycle invariants, and race/failure tests are approved.

### Phase 1: Scaffold And Platform Foundation

Build the new repository:

- Go API and worker commands;
- configuration validation;
- PostgreSQL and Redis clients;
- structured logging/request IDs;
- migration runner;
- health/readiness endpoints;
- Dockerfile and Compose example;
- Vue/Vite/TypeScript app, routing, Pinia, i18n, API client, and test harness;
- CI for backend tests, frontend lint/typecheck/tests/build, migration checks, and container build.

Acceptance:

- clean checkout starts locally with one documented command;
- readiness fails when required dependencies are unavailable;
- secrets never appear in config dumps or logs;
- empty desktop and mobile shells match the sub2api visual tokens.

### Phase 2: Integration Secrets And Typed Clients

Implement:

- envelope-encrypted secret storage and rotation;
- write-only integration forms with step-up authorization;
- typed sub2api client for the scoped carpool groups/accounts/users/API-key metadata/usage endpoints only;
- typed nvtokens transport and fixture-based normalizers;
- manual connection tests;
- sync health, stale-state model, error classification, and audit events;
- provider capability discovery.

Acceptance:

- invalid scoped portal credential and expired nvtokens cookie produce distinct actionable states;
- nvtokens `401 AUTH_REQUIRED` never clears the last good snapshot;
- integration browser responses never include secret material;
- contract tests fail clearly on incompatible response changes.

### Phase 3: Sub2API Integration Extension

In sub2api, implement:

1. human step-up bootstrap/rotation/disable of per-portal credentials, separate scoped middleware, and user-created single-use carpool login-ticket exchange;
2. atomic ungrouped-account claim restricted to paid ChatGPT subscriptions, with structured ownership metadata;
3. stable ascending cursor usage feed;
4. structured ChatGPT settlement-state/provenance endpoint;
5. account-scoped terminal fence that drains admitted HTTP/SSE/WS requests through durable usage persistence and returns an immutable high-water ID;
6. portal-owned group mappings, redacted API-key metadata, durable assignment/restore leases, grant provenance, and controlled account activation;
7. capability advertisement for these features;
8. a frontend `/carpool-connect` route suitable for a custom menu link.

Security requirements:

- ticket TTL 60 seconds and atomic single use;
- opaque portal credentials are shown once, stored only as hashes plus safe metadata, and derive portal identity server-side;
- generic administrative authentication cannot reach scoped integration endpoints or portal-client bootstrap/rotation/disable;
- exact portal and return-origin allowlists;
- no sub2api access/refresh token in exchange response;
- account claim transaction and idempotency key;
- server-side ChatGPT eligibility recheck;
- cursor endpoint limits and redaction;
- inclusive `through_id` support that never moves the terminal settlement boundary;
- stable terminal event IDs and system/manual provenance;
- fail-closed request admission and drain state: tracker, usage-writer, persistence, or reconciliation uncertainty can never produce a ready watermark;
- audit every issue/exchange/claim action;
- every integration read and write verifies that account, group, key assignment, usage scope, state, or fence belongs to the authenticated portal;
- generic admin/user paths cannot alter or delete integration-owned groups, bind/activate integration-owned accounts, bind keys to integration groups, or create/remove their allowed-group grants; emergency recovery is a separate step-up audited operation;
- assignment and restore use a durable lease, row lock/CAS, recorded original group, and reference-counted grant provenance;
- add a new forward-only migration after 196 for credential hashes, portal-client foreign keys, owned-group mappings, assignment leases/grant provenance, and portal-scoped idempotency; do not rewrite migrations 194-196;
- portal credentials cannot access generic admin endpoints or any endpoint that requires a human step-up session.

Acceptance:

- replayed ticket fails;
- portal credential creation/rotation/disable and hash-at-rest tests pass without exposing the token again;
- cross-portal ticket exchange fails;
- cross-portal reads and writes for claims, groups, keys, usage, state, fences, and activation all fail without leaking object existence;
- generic group/account/key/allowed-group bypass attempts against integration-owned objects fail;
- stale-version, conflicting idempotency replay, assignment drift, restore drift, and grant reference-count tests pass;
- concurrent claims have one winner;
- non-ChatGPT, free, abnormal, API-key, and non-OpenAI accounts cannot be claimed;
- cursor ingestion does not skip records inserted during paging;
- concurrent HTTP, SSE, and WebSocket requests admitted before a fence are included through persisted usage, while post-fence admissions are rejected;
- drain/persistence failure, restart, and retry tests never emit a false-ready fence or a changing watermark;
- canonical 7-day exhaustion and system-originated blocked/disabled states are terminal, while 5-hour limits, generic 429, manual pause, and temporary unschedulability are not;
- current sub2api auth, account, and usage tests remain green.

### Phase 4: Portal Authentication And RBAC

Implement the portal SSO redirect/exchange flow, secure portal session cookies, refresh rotation, logout, identity sync, email history, local roles, and permission middleware.

Acceptance:

- a user authenticated by any sub2api-supported method can enter through the connect route;
- inactive/deleted remote users cannot refresh portal sessions;
- email changes preserve the same financial identity;
- participant/admin data isolation is covered by integration tests;
- finance and operations roles cannot perform each other's restricted mutations.

### Phase 5: Market Data And Operator Dashboard

Implement scheduled and manual nvtokens sync, immutable snapshots, normalized Pro/K12 prices, merchant ranking history, freshness indicators, and source health.

Acceptance:

- identical response replay creates no duplicate normalized snapshot;
- changed prices preserve history and show the delta;
- stale data is visible but never labeled current;
- unsupported units/currencies create action items instead of inferred values.

### Phase 6: Intake, Purchases, And Atomic Claiming

Implement polling of ungrouped OpenAI OAuth accounts through the scoped API, server-confirmed paid ChatGPT eligibility, full reconciliation, account detection, atomic claim into a portal-namespaced inactive intake group, portal-owned isolated carpool group creation, schedulability guard, purchase details, attachment/group move, evidence, durable action center, online popup/toast, and notification.

Acceptance:

- each eligible paid ChatGPT subscription account creates one detection record and action item;
- every other ungrouped account is ignored and cannot be claimed;
- popup dismissal does not resolve the action item;
- account stays unschedulable before purchase validation and activation;
- an unmatched account is quarantined in its portal-namespaced intake group, then moves to its mapped portal-owned isolated carpool group only when attached;
- external claim/group drift opens a reconciliation issue;
- retries do not create duplicate groups or purchases.

### Phase 7: Requests, Carpools, Memberships, And API Keys

Implement private/public requests, public marketplace, approvals, carpool creation, account attachment, explicit activation, join requests, membership intervals, API-key selection, group provisioning, restore-on-end, and reconciliation.

Also implement per-carpool Happy Hour policy management through the scoped owned-group endpoint. The portal stores the returned policy version/hash and server timezone, displays active/upcoming events, and uses optimistic versioning plus idempotency for updates. It never receives generic group-edit authority.

Acceptance:

- approved waiting requests do not start usage or reveal account data;
- only attached and activated carpools are active;
- a rejected join has no remote side effects;
- a member can use only the isolated carpool group assigned to the selected dedicated key;
- each isolated carpool group can apply its own versioned Happy Hour policy, including a zero-rate free event, without sharing routing with another carpool;
- foreign, unmanaged, and intake groups cannot be read or changed through the billing-policy endpoint;
- key drift never gets silently overwritten.

### Phase 8: Usage Ingestion And Terminal Event Detection

Implement cursor workers, immutable usage facts, membership-interval attribution, unmatched usage queue, usage drilldown, usage-ratio display, canonical 7-day progress, settlement-state polling/events, terminal-event deduplication, terminal-fence polling, bounded ingestion through the immutable high-water ID, and health metrics. Do not calculate payable principal, fees, or amount due while the account is active.

Acceptance:

- source usage replay is idempotent;
- late and out-of-order facts are handled deterministically;
- usage outside membership interval is not allocated;
- `account_stats_cost` is preferred, then `total_cost`; `actual_cost` is never the allocation weight;
- request-time Happy Hour policy/event/effective-rate attribution is imported exactly and remains unchanged after later policy edits; legacy null attribution remains unknown;
- Happy Hour charge evidence is displayed separately and never changes usage weight, principal, service fee, or amount due;
- active users see usage ratios and 7-day progress but no payable estimate;
- `codex_7d_used_percent >= 100` triggers only with fresh usage data and a future reset timestamp;
- system-originated blocked/disabled events trigger exactly once;
- 5-hour exhaustion, generic 429, manual pause/disable, token refresh, proxy quarantine, and temporary unschedulability never trigger;
- ingestion degradation blocks automatic finalization;
- preview/finalization remains blocked until the remote fence is ready and local ingestion has consumed exactly through its immutable `through_id`;
- user pages never expose another participant's raw facts.

### Phase 9: Settlement Engine And Ledger

After a persisted terminal trigger and completed high-water drain, implement full-purchase-principal settlement preview, unused-seat formula, operator participation rules, largest-remainder rounding, policy snapshots, calculation version/hash, finalization, reopen/revision, statements, append-only ledger, and invariants. The settlement engine must reject direct calculation requests that lack a valid trigger and completed drain.

Required calculation test cases:

- one active participant;
- several active participants with unequal usage;
- mixed active and zero-usage participants;
- operator enrolled and using;
- operator not enrolled/not using;
- operator principal is an owner contribution with no self-payable service fee or receivable;
- all participants zero usage, which must block;
- membership begins/ends mid-period;
- participant joins after account activation;
- source currency conversion and rounding;
- purchase refund/partial credit;
- service fee zero, default, and override;
- unused-seat rate zero, default, and override;
- finalization replay;
- system-blocked trigger;
- system-disabled trigger;
- canonical 7-day exhaustion trigger;
- rejection without a trigger or before drain completion;
- non-trigger cases for 5-hour exhaustion, generic 429, manual pause, and temporary unschedulability;
- reopen creates reversals and a new revision.

Acceptance:

- principal sums to allocated purchase principal at minor-unit precision;
- no payable settlement exists before an authoritative terminal trigger and completed usage drain;
- service fee remains separately visible;
- finalization, statements, and ledger entries commit atomically;
- finalized history is never edited in place;
- property tests cover generated inputs and all invariants in the architecture document.

### Phase 10: Payments, Adjustments, And Notifications

Implement payment recording, confirmation, statement allocation, rejection, refund, void, evidence, adjustment entries, due dates, reminders, overdue state, and user/admin notifications.

Acceptance:

- confirming a payment changes outstanding exactly once;
- duplicate references/idempotency keys do not duplicate credit;
- refunds create reversal entries;
- manual balance changes require amount, reason, actor, and audit record;
- users see principal, service fee, adjustments, payments, and net outstanding separately.

### Phase 11: Complete UI And Design Fidelity

Implement all screens from the product spec. Use:

- participant desktop top nav with dropdown groups;
- participant mobile hamburger navigation;
- admin sidebar with bounded internal scroll;
- teleported dialogs/popovers with a documented z-index scale;
- full-width operational sections and tables, not nested card grids;
- native controls, visible focus, loading/empty/error/skeleton states;
- responsive financial tables that become labeled rows on narrow screens;
- `prefers-reduced-motion` handling;
- English, Simplified Chinese, and Traditional Chinese locale parity.

Visual QA viewports:

- 390x844;
- 768x1024;
- 1440x900;
- 1920x1080.

Acceptance:

- no clipped menus, covered text, horizontal page overscroll, or dialog focus leakage;
- no hardcoded currency symbol in participant screens;
- no gradients, decorative dots/blobs, or generic AI styling;
- typography, colors, radii, shadows, and interaction timing match the current sub2api redesign;
- keyboard and screen-reader names exist for every interactive control.

### Phase 12: Operations, Shadow Run, And Release

Implement reconciliation dashboard, job/dead-letter inspector, audit log, exports, backup/restore guide, metrics/alerts, maintenance mode, feature flags, and runbooks.

Release sequence:

1. deploy with all mutating automation disabled;
2. validate integrations and authenticated fixtures;
3. run detection and usage ingestion in shadow mode;
4. compare source and portal usage totals through at least one real blocked/disabled or 7-day-exhausted ChatGPT account lifecycle;
5. enable atomic claim;
6. enable membership provisioning;
7. enable settlement previews;
8. manually approve initial finalizations;
9. enable notifications and normal operation.

Acceptance:

- backup restore is tested, not merely documented;
- alert fires on usage lag, ledger imbalance, expired cookie, failed claim, and stale action items;
- rollback disables mutation without deleting financial history;
- operator runbook covers every action item type.

## Part 4: Constraints, Interfaces, And Non-negotiable Rules

### Implementation constraints

- Never store or proxy sub2api user passwords.
- Never provide a generic administrative credential to the portal or expose the scoped portal credential or nvtokens cookie to the browser.
- Never access the sub2api database directly.
- Never co-mingle portal receivables with sub2api prepaid balance.
- Never use float64 for stored money or final allocation arithmetic.
- Never infer nvtokens fields that are not proven by authenticated fixtures.
- Never use one global routing group for financially separate carpools.
- Never recompute historical Happy Hour attribution from a group's current policy.
- Never attribute usage before explicit activation.
- Never calculate principal, fees, or amount due before an authoritative terminal event and completed high-water drain.
- Never overwrite a financial balance, finalized line, or confirmed payment.
- Never silently repair remote group/API-key drift.
- Never auto-finalize while usage ingestion is degraded or unmatched usage exists.
- Never push or create a PR unless the primary task explicitly authorizes it.

### Idempotency keys

Use deterministic keys where the source operation is deterministic:

```text
account detection: instance/account
account claim: portal/carpool/account
usage import: instance/source_usage_id
settlement finalization: settlement/revision/input_hash
ledger event: source_type/source_id/revision/entry_kind
notification: template/recipient/source/revision
```

Client-originated finance mutations require a UUID idempotency key and persist the request hash. Reusing a key with a different body is a conflict.

### Concurrency

- Optimistic locking for settings, purchases, requests, carpools, and action items.
- Row locks for settlement finalization, payment confirmation/allocation, and account claim.
- Singleton worker leases with fencing tokens.
- Outbox in the same transaction as domain mutations.

### Data retention

- Financial ledger, settlement snapshots, and audit entries: retain according to operator/legal policy, default indefinitely.
- Raw supplier snapshots: configurable, minimum one year, with secret headers removed.
- Usage facts: at least as long as related financial records.
- Uploaded evidence: private objects with short-lived signed downloads and malware/type/size validation.

## Part 5: Verification, Review, And Handoff

### Required commands

Terra must define exact repository commands early. Minimum gates:

```text
backend format check
backend static analysis
backend unit and integration tests
migration up/down/up test against PostgreSQL
frontend lint check
frontend typecheck
frontend unit and component tests
frontend production build
contract fixture tests
end-to-end lifecycle tests
container build
dependency and secret scan
```

Do not claim a gate passed without reporting the exact command and exit result.

### Required evidence

- migration list and schema diagram;
- API contract/OpenAPI output;
- nvtokens field dictionary and redacted fixtures;
- sub2api compatibility fixtures;
- settlement golden tests and property-test output;
- permission matrix tests;
- desktop/mobile screenshots of every primary workflow;
- accessibility scan plus manual keyboard evidence;
- shadow-run reconciliation report;
- backup/restore test record;
- threat-model review and secret-redaction tests;
- clean diff inventory for both repositories.

### Review boundaries

Request a fresh architecture/security review before committing to:

- login-ticket design;
- atomic claim metadata/schema;
- financial schema and settlement formula;
- payment/ledger reversal model;
- release from shadow mode to mutations.

Request a fresh final review after all implementation and parent verification. The reviewer must return `ship`, `fix-first`, or `rethink` and remain behaviorally read-only.

### Terra handoff format

At the end of each phase, report:

```text
Phase:
Outcome:
Files changed:
Migrations/contracts changed:
Commands run and results:
Evidence produced:
Known gaps or assumptions:
Next phase dependency:
```

## Requirement Traceability

| User requirement | Design location | Proof required |
|---|---|---|
| Link to sub2api with scoped portal credential | Architecture sections 6-7 | credential hashing/rotation, scope-isolation, and typed-client integration tests |
| Fetch Pro/K12 prices | Product 5.2; Architecture 8 | authenticated fixtures and snapshot sync tests |
| Fetch merchant rankings | Product 5.2; Architecture 8 | ranking fixtures/history UI tests |
| User supplies cookies | Product 5.1; Architecture 6/8 | write-only encrypted secret tests |
| Supplier pushes account | Product 5.3 | detection reconciliation E2E |
| Detect no-group ChatGPT account only | Product 5.3; Architecture 7.3 | eligibility and atomic claim tests |
| Add to Shared group | Product 4/5.3 | isolated `shared:<id>` group E2E |
| Ask actual purchase price | Product 5.3 | durable action item plus popup E2E |
| Usage cost ratio in MAI | Product 5.6-5.7 | golden and property tests |
| Calculate only on system block/disable or 7-day exhaustion | Product 5.7; Architecture 7.5 | terminal classification, drain, and no-early-calculation tests |
| Login with sub2api credentials/OAuth | Architecture 7.2 | login ticket E2E from authenticated sub2api user |
| Show outstanding balance | Product 5.8 | statement/ledger dashboard E2E |
| Admin marks paid/updates balance | Product 5.8 | payment and adjustment ledger tests |
| Track by email | Product 5.8 | identity and email-history test |
| 5% customizable service fee | Product 5.7/7 | policy snapshot calculation tests |
| 35% customizable unused charge | Product 5.7/7 | zero-usage golden tests |
| User-created request requires approval/account | Product 5.4 | state transition E2E |
| Public requests and joins | Product 5.5 | marketplace/join approval E2E |
| Operator not using means participants pay | Product 5.7 | operator-excluded golden test |
| Same sub2api design | Product 6 | screenshot, responsive, locale, and accessibility evidence |
| Full admin portal | Product 6-7 | route/permission/screen acceptance inventory |

## Decisions To Confirm Before Phase 0 Closes

These do not block scaffolding but do block financial finalization:

1. MAI precision: recommended two decimal minor units unless MAI already has a stricter definition.
2. Supplier price currency and whether exchange rates are manual, API-fed, or fixed per purchase.
3. Terminal settlement uses the full recorded purchase principal for the account lifecycle; active screens show ratios/progress but no daily payable estimate.
4. Whether 35% applies to the equal-seat baseline, as specified, or a different contractual base.
5. Payment evidence requirements and accepted methods.
6. Whether the operator can participate in a carpool as a normal member.
7. Retention period and jurisdiction-specific invoice/tax wording.
8. Whether account activation should be manual only for the first release, which is recommended.
# Scoped Discovery Delivery

Use the scoped bearer discovery endpoint rather than admin account listing. Implement cursor polling with `after_id=0` scan restart, respect the 30-second per-portal scan interval and six-per-minute burst budget, and treat discovery as advisory. Claims recheck the shared eligible-account predicate under lock and atomically persist scheduler invalidation. Audit fields are limited to portal ID/public ID, cursor, limit, and result count.
