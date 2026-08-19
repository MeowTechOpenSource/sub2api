# Sub2API Carpool Portal: Architecture And Contracts

Status: proposed architecture for implementation

Companion document: `docs/CARPOOL_PORTAL_PRODUCT_SPEC.md`

## 1. Architecture Decision Summary

Use a separate repository and database for the portal. Integrate with sub2api only through HTTP APIs. Add six narrowly scoped integration capabilities to sub2api:

1. a single-use login ticket so an authenticated sub2api user can enter the portal without sharing a password;
2. an atomic account-claim operation that accepts only qualifying paid ChatGPT subscription accounts, so two reconcilers cannot assign the same ungrouped account;
3. a cursor-based usage feed with a fixed upper bound so concurrent writes cannot create pagination gaps or move a settlement boundary;
4. a structured ChatGPT settlement-state endpoint that distinguishes terminal system events and canonical 7-day exhaustion from transient limits;
5. a terminal fence that atomically blocks new request admission, drains admitted HTTP/SSE/WS work through durable usage persistence, and returns one immutable usage high-water ID.
6. portal-owned group and API-key assignment leases that expose redacted key metadata and restore prior routing with compare-and-set semantics.

Each portal authenticates with its own high-entropy, scoped bearer credential. Sub2api derives the portal identity from that credential; request bodies never choose `portal_id`. The portal must not receive the global sub2api admin key or call generic admin APIs. A human sub2api administrator bootstraps, rotates, or disables portal clients through JWT plus recent step-up authentication.

## 2. Current Sub2API Evidence

The plan is based on the current worktree, not generic assumptions:

- `backend/internal/server/middleware/admin_auth.go` proves why the global admin key is unsuitable for portal automation: it grants the full admin surface and is not bound to one portal client.
- `backend/internal/server/routes/admin.go` exposes admin users, groups, accounts, account usage, global usage, API keys, audit, and settings.
- `GET /api/v1/admin/accounts?platform=openai&type=oauth&group=ungrouped` can narrow discovery to OpenAI OAuth accounts.
- `Account.IsOpenAIChatGPTSubscription()` is the authoritative paid ChatGPT subscription classifier: OpenAI OAuth with a non-empty plan other than `free` or `abnormal`.
- `PUT /api/v1/admin/accounts/:id` accepts `group_ids` and account scheduling fields.
- `GET /api/v1/admin/usage` filters by `user_id`, `api_key_id`, `account_id`, `group_id`, and date range.
- Usage records contain `user_id`, `api_key_id`, `account_id`, `group_id`, token counts, `total_cost`, `actual_cost`, and optional `account_stats_cost`.
- Canonical ChatGPT weekly state is stored as `codex_7d_used_percent`, `codex_7d_reset_at`, and `codex_usage_updated_at`; the account schema persists `active`, `error`, or `disabled` status.
- `PUT /api/v1/admin/api-keys/:id` changes a key's group.
- sub2api supports password and several upstream OAuth login methods, but it does not currently act as an OAuth/OIDC provider for a companion application.
- The redesigned frontend uses Vue 3, TypeScript, Tailwind, Sora Variable, Noto Serif SC/TC Variable, rice yellow surfaces, forest green actions, rounded native controls, blurred overlays, and reduced-motion handling.

## 3. Logical Topology

```text
Browser
  |
  v
Carpool Vue SPA ---- same-origin ---- Carpool Go API
                                         |
                +------------------------+-----------------------+
                |                        |                       |
                v                        v                       v
          PostgreSQL                 Redis/queue           Object storage
                |                        |
                +-----------+------------+
                            |
                      Background worker
                       /             \
                      v               v
          sub2api carpool API     nvtokens APIs
          (scoped bearer token)   (session cookie)
```

Deploy the SPA, API, and worker from one repository. The API and worker may be one Go binary with separate commands or modes, but they must use the same service and repository packages.

## 4. Recommended Technology

### Backend

- Go matching the sub2api toolchain.
- Chi or Gin for HTTP; choose Gin if code reuse and developer familiarity matter more than framework minimalism.
- PostgreSQL as the financial system of record.
- Redis for distributed locks, job deduplication, short-lived login state, and rate limiting.
- SQL migrations with explicit up/down behavior; no runtime auto-migration in production.
- Decimal arithmetic library for ratios and exchange rates; integer minor units for money.
- OpenTelemetry-compatible structured logs, metrics, and traces.

### Frontend

- Vue 3, TypeScript, Vite, Pinia, Vue Router, Vue I18n, and Axios.
- Tailwind configuration and design tokens copied intentionally from the current sub2api redesign, not imported from its compiled bundle.
- Lucide Vue icons for new controls. Reuse the current sub2api icon wrapper pattern if it is extracted into a shared package.
- Vitest and Vue Test Utils.

### Deployment

- Multi-stage Dockerfile.
- Docker Compose example for portal, PostgreSQL, and Redis.
- Reverse proxy with TLS and explicit trusted-proxy configuration.
- Separate secret injection for database, encryption key, scoped sub2api portal credential, and nvtokens cookie.

## 5. Repository Layout

```text
carpool-portal/
  cmd/
    api/
    worker/
  internal/
    auth/
    carpool/
    finance/
    integration/
      sub2api/
      nvtokens/
    jobs/
    notification/
    platform/
    purchase/
    settlement/
    usage/
  migrations/
  web/
    src/
      api/
      components/
      composables/
      i18n/
      layouts/
      stores/
      styles/
      views/
  docs/
  deploy/
  testdata/
    nvtokens/
    sub2api/
```

Domain packages must not import HTTP handlers. Integration adapters return typed domain-neutral DTOs and preserve raw response snapshots for audit.

## 6. Trust And Security Boundaries

### Secrets

- The browser never receives the scoped sub2api portal credential, nvtokens cookie, database credential, encryption key, raw API-key value, or raw upstream account credential. The portal never receives the global sub2api admin key.
- Encrypt integration secrets using envelope encryption. Use a deployment master key from the environment and a random data key per secret version.
- Keep old secret versions only long enough to support rotation and audit metadata; never log secret content.
- Redact `Cookie`, `Set-Cookie`, `Authorization`, tokens, account credentials, and uploaded payment evidence metadata from logs.

### Server-side Request Safety

- Allow only configured HTTPS sub2api origins.
- Resolve and reject loopback, link-local, private, multicast, and metadata IP ranges unless the operator explicitly enables a private-network instance at deployment time.
- Revalidate DNS on connection and prevent redirect to an unapproved host.
- nvtokens adapter uses fixed hosts and paths; it must not accept an arbitrary URL from the UI.

### Authorization

- Enforce role checks in the backend, not only in navigation.
- Participant queries always scope by the immutable linked sub2api user ID.
- Finance mutations require finance-admin or operator role.
- Integration secret changes require operator role and recent step-up authentication.
- Settlement finalize/reopen and payment refund require idempotency keys and audit records.

### Financial Integrity

- Use append-only ledger entries.
- Finalized settlement lines are immutable; reopening creates a new revision and reversal entries.
- Store calculation version, policy snapshot, source usage high-water ID, and a canonical input hash.
- Use database constraints to prevent duplicate source usage, duplicate payment references within an instance, and multiple active claims for one sub2api account.

## 7. Sub2API Integration Contract

### 7.1 Portal Authentication And API Boundary

All server-to-server portal calls use a scoped credential:

```http
Authorization: Bearer <opaque portal credential>
Accept: application/json
```

The credential is random, stored only as a hash plus safe last-four metadata in sub2api, shown once on creation/rotation, and bound to one active `carpool_portal_clients` row. Authentication derives the portal client ID server-side. Portal endpoints live under `/api/v1/integrations/carpool`; they do not inherit global admin-key authentication and do not accept caller-supplied portal identity.

Human-only portal-client creation, rotation, origin changes, and disablement live under `/api/v1/admin/carpool/portal-clients`, require an administrator JWT plus recent step-up authentication, and never accept the global admin API key.

The portal uses only the scoped endpoints in this section through a typed client that:

- sets a bounded timeout;
- retries only idempotent operations;
- propagates a request ID;
- classifies authentication, validation, conflict, rate-limit, and upstream failures;
- records response status and latency without response secrets;
- supports contract fixtures for every consumed response.

Every scoped endpoint, including reads, resolves its account, group, key, usage filter, state observation, fence, or assignment through the authenticated portal's ownership relations. A foreign object returns the same not-found response as an absent object. Caller-supplied numeric IDs are selectors, never authorization.

### 7.2 Minimal Sub2API Extension A: Login Ticket

Purpose: let any user authenticated by sub2api password, passkey, or configured OAuth enter the portal without exposing their credentials to the portal.

User endpoint, JWT-authenticated:

```http
POST /api/v1/user/integrations/carpool/login-ticket
Content-Type: application/json

{
  "portal_id": "portal_public_id",
  "return_to": "https://carpool.example.com/auth/callback"
}
```

Response:

```json
{
  "data": {
    "ticket": "opaque-256-bit-value",
    "expires_at": "2026-08-05T12:00:30Z"
  }
}
```

Server-to-server exchange, scoped-portal authenticated:

```http
POST /api/v1/integrations/carpool/login-ticket/exchange
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "ticket": "opaque-256-bit-value"
}
```

Response:

```json
{
  "data": {
    "user_id": 123,
    "email": "member@example.com",
    "username": "member",
    "role": "user",
    "status": "active",
    "avatar_url": "https://...",
    "authenticated_at": "2026-08-05T12:00:00Z"
  }
}
```

Ticket requirements:

- opaque random value, hashed at rest in Redis;
- 60-second lifetime;
- bound to portal ID and exact allowlisted return origin;
- single use, atomically consumed;
- invalidated when the user is inactive;
- rate limited and audit logged;
- exchange response never contains sub2api access or refresh tokens.

Add a small sub2api frontend route that creates the ticket and redirects to the allowlisted portal. This route becomes the target of a custom sub2api menu item.

### 7.3 Minimal Sub2API Extension B: Atomic Account Claim

Purpose: replace unsafe GET-then-PUT claiming with one transaction.

```http
POST /api/v1/integrations/carpool/accounts/:id/claim
Idempotency-Key: <deterministic claim UUID>
Content-Type: application/json

{
  "carpool_id": null,
  "claim_scope": "intake",
  "group_id": 456,
  "set_schedulable": false
}
```

Behavior:

- lock the account row;
- atomically recheck `Account.IsOpenAIChatGPTSubscription()` and reject every non-ChatGPT, free, abnormal, API-key, or non-OpenAI account with `422 ACCOUNT_NOT_ELIGIBLE`;
- succeed only if it currently has no groups, or if it is already claimed by the same portal/scope/carpool/idempotency key;
- add the inactive portal-namespaced `shared:intake:<portal-client-id>` quarantine group, or the mapped portal-owned carpool group when `claim_scope=carpool`, plus an integration ownership marker without replacing unrelated `extra` values;
- set schedulability as requested;
- write a sub2api audit entry;
- return `409 ACCOUNT_ALREADY_CLAIMED` with non-sensitive ownership metadata on conflict.

Do not place the portal ownership marker in free-form notes. Add a structured integration metadata relation or namespaced JSON field with merge semantics.

### 7.4 Minimal Sub2API Extension C: Cursor Usage Feed

Purpose: ingest append-only usage without page drift.

```http
GET /api/v1/integrations/carpool/usage?after_id=1000&through_id=1750&account_id=321&limit=500
```

Response:

```json
{
  "data": {
    "items": [],
    "next_after_id": 1500,
    "through_id": 1750,
    "has_more": true
  }
}
```

Requirements:

- stable ascending order by usage-log ID;
- exclusive `after_id` cursor;
- optional inclusive `through_id` upper bound; every settlement drain must supply the immutable watermark returned by its terminal fence;
- when `through_id` is supplied, never return a row above it, echo it unchanged, and set `has_more=false` only after all matching rows through that bound have been consumed;
- limit bounded to 1-1000;
- optional repeated `account_id` filters or one carpool ownership filter;
- same redaction rules as current admin usage DTO;
- response includes `account_stats_cost` when available;
- no delete/cleanup behavior in this endpoint.

Until this extension ships, an MVP may poll current admin usage with a time overlap and deduplicate by usage ID, but it must display `degraded ingestion` and block automatic settlement finalization.

### 7.5 Minimal Sub2API Extension D: ChatGPT Settlement State

Purpose: expose a structured, auditable terminal signal without forcing the portal to parse free-form account errors.

```http
GET /api/v1/integrations/carpool/accounts/:id/settlement-state
```

Response:

```json
{
  "data": {
    "account_id": 321,
    "is_chatgpt_subscription": true,
    "account_status": "active",
    "system_state": "active",
    "system_reason_code": null,
    "system_event_id": null,
    "codex_7d_used_percent": 83.5,
    "codex_7d_reset_at": "2026-08-09T10:00:00Z",
    "codex_usage_updated_at": "2026-08-05T10:00:00Z",
    "terminal": false,
    "terminal_reason": null
  }
}
```

Requirements:

- derive ChatGPT eligibility through `IsOpenAIChatGPTSubscription()`;
- return a stable system event ID and structured reason/provenance when sub2api itself blocks or disables the account;
- distinguish `system_blocked` and `system_disabled` from manual admin pause/disable, temporary `schedulable=false`, token refresh, proxy quarantine, and ordinary rate limiting;
- mark `seven_day_exhausted` terminal only when `codex_7d_used_percent >= 100`, `codex_usage_updated_at` is fresh, and `codex_7d_reset_at` is later than the observation time;
- never infer seven-day exhaustion from a generic 429 or `usage_limit_reached` response without a normalized 7-day window;
- expose 5-hour state only as non-terminal diagnostic data;
- keep terminal event identity stable across polling and retries.

If existing account persistence cannot provide structured system-event provenance, add a bounded account-state event table/outbox record in sub2api rather than parsing `error_message` text.

### 7.6 Minimal Sub2API Extension E: Terminal Fence And Drain Watermark

Purpose: make the financial settlement boundary provable. Observing a terminal state is not enough because an HTTP, SSE, or WebSocket request admitted before that observation may finish and persist usage later.

```http
POST /api/v1/integrations/carpool/accounts/:id/terminal-fences
Idempotency-Key: <portal lifecycle key>
Content-Type: application/json

{
  "source_terminal_event_id": "evt_123",
  "expected_account_version": 42
}
```

The create call atomically revalidates the qualifying paid ChatGPT account and stable terminal event, installs an account-scoped admission fence, and returns a durable fence ID. The portal polls the fence until it is ready:

```http
GET /api/v1/integrations/carpool/accounts/:id/terminal-fences/:fence_id
```

```json
{
  "data": {
    "id": "fence_123",
    "state": "ready",
    "source_terminal_event_id": "evt_123",
    "admission_blocked_at": "2026-08-05T10:00:00Z",
    "drained_at": "2026-08-05T10:00:03Z",
    "usage_high_water_id": 1750
  }
}
```

Requirements:

- install the account-scoped admission fence before acknowledging creation; all later HTTP, SSE, and WebSocket admissions for that account fail closed;
- register every admitted request before it can reach the upstream account and retain its lifecycle identity across streaming transports;
- consider a pre-fence request drained only after request completion and successful durable usage-log persistence, including any required batch flush;
- do not report `ready`, `drained_at`, or `usage_high_water_id` while the in-flight tracker, usage writer, database, or reconciliation state is unknown or degraded; a best-effort zero is never proof of drain;
- after all pre-fence requests have durably persisted usage, read and store the database usage-log maximum in the same fenced lifecycle, then expose that immutable value on every retry;
- make create idempotent for `(account_id, source_terminal_event_id, portal lifecycle key)` and reject conflicting event/version reuse;
- preserve the fence across process restarts and require an audited operator recovery flow for durable failures; never silently reopen admissions;
- bind the fence to the stable structured terminal event, not to free-form errors, generic 429s, 5-hour exhaustion, manual pauses, or temporary unschedulability;
- emit audit/outbox events for creation, admission block, drain failure, ready watermark, and recovery.

The portal may create a settlement trigger after the stable terminal event is persisted, but it cannot preview or finalize money until this fence is `ready` and the cursor feed has consumed exactly through `usage_high_water_id` with no unmatched or failed usage facts.

### 7.7 Minimal Sub2API Extension F: Portal-owned Membership Provisioning

The scoped API provides:

```text
POST /api/v1/integrations/carpool/groups/ensure
GET  /api/v1/integrations/carpool/groups/:id/billing-policy
PUT  /api/v1/integrations/carpool/groups/:id/billing-policy
GET  /api/v1/integrations/carpool/users/:id/api-keys
PUT  /api/v1/integrations/carpool/api-keys/:id/assignment
POST /api/v1/integrations/carpool/api-key-assignments/:id/restore
PUT  /api/v1/integrations/carpool/accounts/:id/activation
```

- `groups/ensure` accepts a carpool public ID and kind, not a portal ID. It creates or replays an explicitly configured inactive, exclusive OpenAI group named `shared:<portal-client-id>:<carpool-public-id>` or the namespaced intake group. A durable mapping owns the group; an unmanaged same-name group is a conflict.
- billing-policy GET/PUT derives portal identity from the scoped bearer and resolves the durable owned-group mapping. Foreign, unmanaged, and intake groups return the same scoped not-found response. PUT replaces only the base rate and complete ordered Happy Hour event list; it requires `Idempotency-Key` and `expected_version`, returns version/hash and the server IANA timezone, and triggers API-key auth-cache invalidation atomically. It cannot alter routing, models, limits, status, assignments, grants, or any unrelated group field;
- Happy Hour event IDs are immutable identity, while names are mutable labels. The contract bounds event count, ID/name length, and multiplier range; rejects duplicate IDs, non-finite values, invalid same-day windows, and enabled-window overlap; and advertises `carpool_billing_policy.v1`;
- the key list structurally omits the raw key and returns only ID, user ID, name, group ID, status, last-used, expiry, and timestamps;
- assignment creates a durable lease containing authenticated portal, carpool, membership, key, user, original group, assigned group, request hash, and lifecycle state. It locks the key, validates its user and mapped target, compares the observed current group, and changes routing once;
- restore is permitted only through that lease and only when the key is still in the recorded assigned group. It restores the recorded original group; drift returns `409` and creates an audit/reconciliation event;
- exclusive `user_allowed_groups` grants are created transactionally and removed with reference counting only when the lease created the grant and no active lease still needs it;
- generic user/admin paths reject alteration or deletion of integration-owned groups, account binding/schedulability changes for portal-owned claims, key binding to integration-owned groups, and direct creation/removal of their `user_allowed_groups` grants. Emergency recovery is a separate audited, step-up human operation;
- activation verifies the authenticated portal's account claim and group mapping, paid ChatGPT eligibility, carpool identity, expected account version, and absence of terminal events/fences. It updates schedulability and scheduler invalidation/outbox state atomically;
- every mutation scopes its idempotency key to authenticated portal plus operation and stores a canonical request hash. Cross-portal IDs, conflicting replays, unmanaged groups, and stale versions fail closed.
- add these relations in a new forward-only migration after migrations 194-196: portal credential hash/version metadata, portal-client foreign keys on claims and fences where required, owned-group mappings, assignment leases with grant provenance, and portal-scoped idempotency records. Do not rewrite already shipped migration files.

## 8. Nvtokens Adapter Contract

The authenticated response schemas are not yet available. First implementation task:

1. Store the operator-supplied cookie through the encrypted secret endpoint.
2. Fetch both endpoints server-side.
3. Save the exact redacted bodies as versioned test fixtures.
4. Document field meaning, units, nullability, paging, timestamps, and account-type identifiers.
5. Build strict decoders from those fixtures.

Adapter interface:

```go
type MarketClient interface {
    FetchPriceBoard(ctx context.Context) (RawSnapshot, error)
    FetchMerchantRankings(ctx context.Context) (RawSnapshot, error)
}

type MarketNormalizer interface {
    NormalizePriceBoard(snapshot RawSnapshot) ([]MarketPrice, error)
    NormalizeMerchantRankings(snapshot RawSnapshot) ([]MerchantRanking, error)
}
```

Rules:

- fixed origin `https://nvtokens.com`;
- no browser automation;
- no silent cookie refresh using stored passwords;
- classify `401 AUTH_REQUIRED` as `credentials_expired` and notify the operator;
- retain last good snapshot but label it stale;
- store response checksum and fetch metadata;
- unknown fields remain in the raw snapshot and do not break decoding unless required fields become invalid.

## 9. Data Model

Use UUIDv7 or ULID public IDs and internal bigint primary keys. Every mutable table has `created_at`, `updated_at`, and an optimistic version where concurrent admin edits matter.

### Integration And Identity

`instances`

- id, public_id, name, base_url, status, timezone
- encrypted_portal_credential_id, last_validated_at, last_error
- remote_version, capabilities_json

`portal_clients`

- portal ID registered in sub2api, allowlisted return origins, status, credential version and safe validation metadata; raw credential is never stored

`external_identities`

- instance_id, sub2api_user_id, current_email, normalized_email, username, avatar_url, remote_role, remote_status
- unique `(instance_id, sub2api_user_id)`

`identity_email_history`

- external_identity_id, normalized_email, observed_from, observed_to

`local_roles`

- external_identity_id, role

`integration_secrets`

- provider, encrypted_data_key, ciphertext, key_version, rotated_at, validation metadata

### Supplier Market

`supplier_snapshots`

- provider, endpoint_kind, fetched_at, status_code, schema_version, checksum, encrypted/raw redacted JSON, normalization status

`market_prices`

- snapshot_id, account_type, merchant_external_id, source_currency, amount_minor, duration, available_quantity, normalized fields

`merchant_rankings`

- snapshot_id, merchant_external_id, rank, score, normalized metrics, raw item JSON

### Account Intake And Purchases

`detected_accounts`

- instance_id, sub2api_account_id, first_seen_at, remote_created_at, platform, type, display_name
- confirmed ChatGPT subscription flag, normalized remote plan type, eligibility evidence/version
- claim status, remote group state snapshot, action status, last_reconciled_at
- unique `(instance_id, sub2api_account_id)`

`purchases`

- detected_account_id, account_type, supplier, merchant external ID, order reference
- source currency/amount minor, source-to-HKD exchange rate, HKD principal minor
- purchased_at, service_start_at, service_end_at, evidence object ID
- policy snapshot, status

### Carpool Lifecycle

`carpool_requests`

- requester identity, account type, visibility, desired dates, desired seats, message, policy acceptance version, state

`carpools`

- public ID, title, account type, visibility, state, owner/operator identity
- sub2api instance/group ID and exact remote group name
- capacity, activation/closing/closed timestamps
- service-fee and unused-seat snapshots

`carpool_accounts`

- carpool_id, detected_account_id, purchase_id, attached_from, attached_to
- unique active attachment per account

Attaching an intake account moves it from its portal-namespaced intake group into `shared:<portal-client-id>:<carpool-public-id>` while it remains unschedulable. Activation is a separate transition.

`join_requests`

- carpool_id, requester identity, state, decision actor/time/reason

`memberships`

- carpool_id, identity_id, role (`participant` or `operator_participant`), state
- approved_at, activated_at, ended_at, reason

`member_api_keys`

- membership_id, sub2api_api_key_id, masked key name, previous_group_id, assigned_group_id
- provisioned_at, restored_at, last_reconciled_at, state

### Usage And Settlement

`usage_cursors`

- instance_id, feed name/account ID, after_id, updated_at, health

`usage_facts`

- instance_id, source_usage_id, account/user/API-key/group IDs
- occurred_at, model, request type, token counts
- total cost decimal, actual cost decimal, account-stats cost decimal, chosen usage weight decimal
- nullable immutable pricing attribution: policy version/hash/timezone, resolved base multiplier, applied Happy Hour event ID/name/multiplier, effective billing multiplier, and billing subject
- raw checksum, ingested_at
- unique `(instance_id, source_usage_id)`

Pricing attribution is captured by sub2api at the same frozen request pricing instant used for billing and is never reconstructed from current policy. `usage_logs.rate_multiplier` is an effective billed multiplier that may include user overrides or media semantics; it is not labeled as a pure group multiplier. Happy Hour and `actual_cost` are charge evidence only. Settlement continues to choose `account_stats_cost`, then `total_cost`, as usage weight.

`account_state_observations`

- detected_account_id, observed_at, account status, system state/reason/event ID
- 7-day used percent/reset/update timestamps, terminal flag/reason, raw checksum
- unique source system event ID where present

`settlement_triggers`

- carpool_id, detected_account_id, trigger type (`system_blocked`, `system_disabled`, `seven_day_exhausted`, exceptional `forced`)
- source event ID, observed_at, drained_at, usage high-water ID, account-state snapshot, status
- unique active trigger per carpool/account lifecycle

`settlement_periods`

- carpool_id, purchase_id, period start/end, revision, state
- settlement trigger ID, source high-water ID, full purchase principal HKD minor, policy snapshot, calculation version, input hash

`settlement_lines`

- settlement_id, membership_id, usage weight, usage ratio
- idle principal, usage principal, total principal, service fee, adjustment, amount due minor
- rounding rank and explanation JSON
- unique `(settlement_id, membership_id)`

### Ledger And Payments

`ledger_accounts`

- identity_id, currency, status

`ledger_entries`

- account_id, entry type, amount minor signed, effective_at
- settlement/payment/adjustment reference, idempotency key, reason, actor

`payments`

- payer identity, amount minor, currency, method, external reference, paid_at, state, evidence

`payment_allocations`

- payment_id, settlement_line_id, amount minor

### Operations

`action_items`, `notifications`, `job_runs`, `dead_letters`, `audit_logs`, `outbox_events`, `settings`, and `object_files`.

## 10. State Machines

### Intake

```text
detected -> claiming -> awaiting_purchase_details -> ready_for_attachment -> active
              |                    |                        |
              v                    v                        v
           conflict            rejected                 retired
```

### Membership

```text
requested -> approved_waiting_activation -> provisioning -> active -> ended
    |                    |                       |
    v                    v                       v
 rejected             cancelled              suspended
```

### Settlement

```text
tracking_usage -> settlement_triggered -> draining -> preview -> finalized
                          |          |          |          |
                          v          v          v          v
                       disputed    blocked   cancelled   reopened -> superseded
```

There is no payable `open_estimate` state. The system records usage ratios while active, but principal and fees are first calculated after the terminal trigger has been persisted and usage has drained through its high-water mark.

### Payment

```text
recorded -> pending_confirmation -> confirmed -> allocated
    |               |                 |
    v               v                 v
  void            rejected          refunded
```

Every state transition is validated in the domain service, transactionally persisted, and audit logged.

## 11. Portal API Surface

### Authentication

```text
GET  /api/v1/auth/sub2api/start
GET  /api/v1/auth/sub2api/callback
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

The portal issues its own short-lived session after ticket exchange. Use secure, HttpOnly, SameSite=Lax cookies and rotating refresh sessions. Do not place tokens in local storage.

### Participant

```text
GET  /api/v1/dashboard
GET  /api/v1/market/carpools
POST /api/v1/carpool-requests
GET  /api/v1/carpool-requests
POST /api/v1/carpools/:id/join-requests
GET  /api/v1/carpools
GET  /api/v1/carpools/:id
GET  /api/v1/carpools/:id/api-key-options
PUT  /api/v1/carpools/:id/api-key
GET  /api/v1/usage
GET  /api/v1/statements
GET  /api/v1/statements/:id
GET  /api/v1/payments
POST /api/v1/payments/:id/evidence
```

### Admin

```text
GET/PUT  /api/v1/admin/integrations/sub2api
GET/PUT  /api/v1/admin/integrations/nvtokens
POST     /api/v1/admin/integrations/:provider/test
POST     /api/v1/admin/sync/:provider
GET      /api/v1/admin/action-items
PUT      /api/v1/admin/action-items/:id
GET      /api/v1/admin/intake
POST     /api/v1/admin/intake/:id/purchase
POST     /api/v1/admin/intake/:id/claim
GET/POST /api/v1/admin/carpools
GET/PUT  /api/v1/admin/carpools/:id
POST     /api/v1/admin/carpools/:id/activate
POST     /api/v1/admin/carpools/:id/force-terminal-event
GET/PUT  /api/v1/admin/requests/:id
GET/PUT  /api/v1/admin/join-requests/:id
GET/PUT  /api/v1/admin/memberships/:id
GET      /api/v1/admin/settlements
POST     /api/v1/admin/settlements/:id/preview
POST     /api/v1/admin/settlements/:id/finalize
POST     /api/v1/admin/settlements/:id/reopen
GET/POST /api/v1/admin/payments
POST     /api/v1/admin/payments/:id/confirm
POST     /api/v1/admin/payments/:id/refund
POST     /api/v1/admin/ledger/adjustments
GET      /api/v1/admin/reconciliation
POST     /api/v1/admin/reconciliation/run
GET      /api/v1/admin/audit-logs
GET/PUT  /api/v1/admin/settings
```

All mutation endpoints accept `Idempotency-Key`. List endpoints use cursor pagination for high-write tables and return filter metadata.

## 12. Background Jobs

- nvtokens price board sync: every 5 minutes by default.
- nvtokens merchant ranking sync: every 15 minutes.
- ungrouped account detection: every 30 seconds.
- full account reconciliation: every 10 minutes.
- usage feed ingestion: every 15 seconds for active carpools.
- ChatGPT account settlement-state watch: every 15 seconds for active carpools.
- membership/API-key reconciliation: every 5 minutes.
- usage ratio and 7-day progress recompute: after usage/state ingestion, coalesced per carpool; no payable estimate.
- statement reminders: scheduled in portal timezone with per-user delivery preference.
- stale integration and cookie-expiry checks: hourly.
- outbox dispatch and dead-letter retry: continuous bounded exponential backoff.

Use PostgreSQL advisory locks or Redis leases so only one worker runs a singleton job. Every job has a deterministic idempotency scope and bounded batch size.

## 13. Reconciliation Rules

Open an action item instead of guessing when:

- an ungrouped account was claimed elsewhere;
- a managed account's group changes outside the portal;
- a participant key no longer exists or its group was changed manually;
- usage references an unknown user, key, account, or membership interval;
- a blocked/disabled account has no structured system provenance;
- 7-day usage reports 100% with a missing, stale, or expired canonical window;
- supplier price currency/unit is unknown;
- purchase dates overlap unexpectedly;
- source usage appears after a finalized high-water mark;
- portal principal, ledger receivable, payment allocation, or outstanding totals disagree.

Reconciliation reports expose expected state, observed state, first/last seen, severity, suggested action, and resolution audit trail.

## 14. Observability And Audit

Metrics:

- sync success/failure/latency by provider;
- account detection and claim counts;
- usage cursor lag in records and seconds;
- unmatched usage count and upstream allocation weight;
- terminal-event detection, drain, settlement preview, and finalize failures;
- ledger imbalance gauge, which must remain zero;
- outstanding and overdue HKD totals;
- action item age;
- notification delivery status.

Audit every secret rotation, integration test, account claim, purchase edit, request decision, membership change, API-key group change, settlement transition, payment transition, adjustment, role change, and settings change. Store actor, source IP, request ID, before/after redacted values, reason, and timestamp.

## 15. Test Strategy

### Unit

- settlement allocation, idle fee, operator inclusion, largest remainder, and exchange-rate snapshots;
- all state transition guards;
- money and decimal serialization;
- nvtokens schema normalization from fixtures;
- sub2api error classification;
- permission matrix.

### Integration

- PostgreSQL constraints and transactional ledger balance;
- Redis single-use tickets and job locks;
- account claim idempotency and conflict handling;
- usage cursor replay and deduplication;
- ChatGPT-only intake eligibility and terminal-state classification;
- payment allocation and refund reversals;
- outbox transaction behavior.

### Contract

- recorded redacted responses for every consumed sub2api endpoint;
- authenticated redacted nvtokens fixtures supplied by the operator;
- version/capability negotiation and unsupported-version behavior.

### End-to-end

- sub2api-authenticated user enters portal via ticket;
- create request, approve, detect a paid ChatGPT account, enter purchase, attach, activate, select key, ingest usage, observe a terminal system/7-day event, drain, finalize, and pay;
- public join approval and rejection;
- operator not using the account;
- 7-day exhaustion triggers once, while 5-hour exhaustion and generic 429 do not trigger;
- system-originated blocked/disabled triggers, while manual pause and temporary unschedulability do not;
- zero-usage participant charge;
- external key/group drift and reconciliation;
- expired nvtokens cookie;
- mobile navigation, dialogs, tables, focus trapping, reduced motion, and localization.

### Property Tests

For generated participants, costs, usage, and rates:

- principal allocations sum exactly to purchase principal;
- no non-negative input produces a negative principal;
- replay produces identical lines and input hash;
- rounding is deterministic;
- confirmed payments plus credits reduce outstanding by exactly their allocated amount;
- reversing a financial event returns the ledger to its previous balance.

## 16. Release And Recovery

- Feature flags: supplier sync, auto-claim, SSO ticket, usage cursor, settlement-state watch, finalization, notifications.
- Begin in shadow mode: detect and calculate without changing groups or creating ledger entries.
- Compare portal usage totals with sub2api account/user totals for at least one full account term.
- Enable account claim, then participant provisioning, then settlement finalization in separate gates.
- Back up PostgreSQL and object storage before every migration release.
- A rollback may disable workers and UI mutations, but never delete or rewrite finalized financial history.
# Scoped Account Discovery

Portal workers use `GET /api/v1/integrations/carpool/accounts?state=ungrouped&after_id=...&limit=...` with the dedicated scoped bearer, never the generic admin account listing. Discovery returns only account ID, RFC3339Nano version, `paid_chatgpt` classification, schedulable state, and timestamps. It is advisory and cursor ordered; a complete scan restarts with `after_id=0`.

Discovery and claim share the canonical active, undeleted, non-shadow OpenAI OAuth paid-plan, ungrouped, unclaimed predicate. Discovery is limited per portal to one scan per 30 seconds and a conservative six requests per minute. It is audited with portal ID/public ID, cursor, limit, and result count only. Claim remains authoritative: it locks and rechecks eligibility, binds the owned inactive group, disables scheduling, persists ownership, and atomically enqueues scheduler invalidation.
