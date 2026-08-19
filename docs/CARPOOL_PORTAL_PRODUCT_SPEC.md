# Sub2API Carpool Portal: Product Specification

Status: execution-ready design

Target audience: product owner, GPT-5.6 Terra implementer, reviewer, and operator

## 1. Product Summary

Build a separate companion application that connects to one or more sub2api instances. It manages shared Pro/K12 account purchases, participant approval, usage-based cost allocation, receivables, and operator workflows without modifying sub2api's prepaid user balance.

The operator pays suppliers first. The portal then:

1. Fetches current Pro/K12 market prices and merchant rankings from nvtokens.
2. Detects newly pushed paid ChatGPT subscription accounts in sub2api that have no group.
3. Creates an intake action asking the operator for the actual purchase price.
4. Assigns the account to an isolated Shared carpool group.
5. Activates approved participants only after an account is attached to the carpool.
6. Imports usage from sub2api and continuously records each participant's upstream usage weight and ratio; this evidence is not portal money.
7. Calculates the payable allocation only when the ChatGPT account is system-blocked/system-disabled or its canonical 7-day usage reaches 100%.
8. Tracks what each participant owes the operator, including service fees, payments, credits, and manual adjustments.

The portal is a receivables and allocation system. It must not debit, credit, freeze, or otherwise reuse the user's prepaid sub2api balance.

## 2. Product Principles

- Financially explainable: every amount shown must drill down to immutable source facts, formula inputs, and ledger entries.
- Separate systems of record: sub2api owns identity, API keys, accounts, groups, and raw usage; this portal owns carpool requests, purchase cost, allocation policy, statements, and payments.
- No password proxying: the portal never receives or stores a sub2api password.
- Approval before access: a request can exist before supply, but counting and visibility begin only after approval, account attachment, and activation.
- Idempotent automation: every poll, claim, import, settlement, and payment action must be safe to retry.
- Operator control: uncertain account matches, missing prices, zero-usage periods, refunds, and upstream inconsistencies enter a durable review queue.
- Matching design: the portal must look and behave like the current redesigned sub2api frontend.

## 3. Personas And Roles

### Participant

- Signs in through their existing sub2api session.
- Browses public carpool requests.
- Creates a private or public request.
- Requests to join a public carpool.
- Selects a dedicated sub2api API key for an approved carpool.
- Sees usage, allocation ratio, ChatGPT 7-day progress, finalized statements, payments, and credits. No payable estimate is created while the account remains active.
- Cannot see another participant's email, API key, raw usage records, or balance.

### Operator

- Owns and funds purchases.
- Configures sub2api and nvtokens integrations.
- Reviews detected ungrouped paid ChatGPT subscription accounts and enters actual purchase details.
- Approves or rejects carpool requests and join requests.
- Attaches accounts, activates/pauses carpools, reviews terminal account events, and handles exceptional forced closure.
- Marks participant payments as paid, void, refunded, or disputed.
- Adds reasoned manual adjustments without rewriting history.

### Finance Admin

- Reviews statements, settlements, payments, credits, overdue balances, exports, and reconciliation.
- Can review and finalize a trigger-created settlement or reopen it with a mandatory reason and audit record.
- Cannot change supplier credentials or identity integration settings.

### Operations Admin

- Manages accounts, pools, participants, sync jobs, and incidents.
- Cannot mark payments or alter finalized settlement amounts.

### Read-only Auditor

- Can inspect all configuration snapshots, audit logs, statements, and reconciliation evidence.
- Cannot mutate data.

## 4. Core Terms

- Instance: a configured sub2api deployment.
- Supplier snapshot: a timestamped response from an nvtokens endpoint.
- Detected account: a paid ChatGPT subscription account first observed in sub2api without any group.
- Purchase: the actual acquisition of one supplier account, including price, currency, term, merchant, and evidence.
- Carpool: one financial and routing boundary that participants join.
- Shared: the user-facing category containing all carpools.
- Shared group: an isolated sub2api group owned by one authenticated portal and named `shared:<portal-client-id>:<carpool-public-id>`.
- Participant: a sub2api user approved for a carpool.
- Usage fact: an immutable local copy of a sub2api usage record.
- Settlement: a reproducible allocation created after the managed ChatGPT account becomes system-blocked/system-disabled or exhausts its canonical 7-day allowance.
- Statement: participant-facing amount due for one settlement period.
- Ledger: append-only financial entries that produce each participant's outstanding balance.

## 5. Required Workflows

### 5.1 Integration Setup

The operator enters:

- sub2api base URL;
- a scoped sub2api portal credential created by a human administrator; the portal never receives the global admin key;
- nvtokens session cookies;
- fixed portal accounting currency `HKD` with symbol `HK$`, independent from sub2api balances;
- source currency to HKD conversion settings if the supplier price is not already in HKD;
- default service-fee rate, default 5%;
- default unused-seat rate, default 35%;
- sync intervals and notification destinations.

Secrets are write-only in the UI. After saving, show only status, last four characters where safe, last validation time, expiry warning, and a replace/revoke action.

### 5.2 Supplier Price And Ranking Sync

The portal fetches:

- `GET https://nvtokens.com/api/pool/price-board`
- `GET https://nvtokens.com/api/merchant-rankings`

Both endpoints currently return `401 AUTH_REQUIRED` without valid session cookies. Their authenticated schemas must be captured as redacted fixtures before the adapter is finalized.

The portal stores every successful response as an immutable snapshot and normalizes only fields proven by captured fixtures. The dashboard shows:

- latest Pro and K12 prices;
- change from previous snapshot;
- merchant ranking and confidence signals available in the response;
- fetched time, source freshness, and stale/error state;
- no fabricated price when the source is unavailable.

### 5.3 New Account Intake

1. A background reconciler queries ungrouped OpenAI OAuth accounts, then accepts only accounts that sub2api classifies as paid ChatGPT subscriptions. Other ungrouped platforms, API-key accounts, free/abnormal ChatGPT plans, and unrelated OpenAI OAuth accounts are ignored.
2. It records an idempotent detection event keyed by `(instance_id, sub2api_account_id)`.
3. It pauses scheduling while the account is being claimed.
4. It atomically claims the account into an inactive, unschedulable portal-namespaced intake group. If a carpool is already known, the same transaction may assign its portal-owned isolated group instead.
5. It creates a durable admin action item in `awaiting_purchase_details`.
6. Online admins receive a popup/toast; offline admins see the action at the next login and may receive email.
7. The operator enters actual price, source currency, source-to-HKD exchange rate, account type (Pro/K12), supplier/merchant, purchased time, service term, expiry, order reference, and optional evidence.
8. The account remains unschedulable until purchase details and carpool attachment are valid.
9. Attachment moves the account from the portal-namespaced intake group to the isolated carpool group. Activation makes the carpool visible to approved members and begins usage counting from one explicit timestamp.

The popup is a convenience. The durable action item is the source of truth and must never disappear merely because the popup was closed.

### 5.4 Create A Carpool Request

A participant supplies:

- Pro or K12 account type;
- private or public visibility;
- requested start and expected duration;
- desired seats or optional capacity note;
- optional message to the operator;
- acceptance of the current fee policy.

Request states:

`draft -> submitted -> approved_waiting_account -> active -> settlement_triggered -> closing -> closed`

Alternate terminal states:

`rejected`, `cancelled`, `expired`

Approval alone does not create access, show an account, or start accounting. Those actions require an attached account and explicit activation.

### 5.5 Public Carpool Join

1. Only an attached and active public carpool appears in the marketplace, without sensitive account data. Approved-waiting requests remain hidden.
2. A user submits a join request.
3. The operator approves or rejects it.
4. On approval, the user selects or creates a dedicated sub2api API key.
5. The portal records the key ID, its previous group, and assigns it to the carpool's isolated group.
6. Access begins at `membership.activated_at`; earlier usage is never attributed to that membership.
7. On removal or close, the portal restores the key's previous group when safe, or disables the mapping and opens a review item if state has changed externally.

No secret API-key value is copied into the portal. Only the sub2api key ID, masked name, and group assignment are stored.

#### 5.5.1 Carpool Happy Hour Policy

Every isolated carpool group may have its own base billing multiplier and ordered Happy Hour events. Portal admins manage that policy through a narrowly scoped sub2api integration endpoint; the portal credential cannot perform arbitrary group edits. Intake groups do not have a billing policy.

Each event has an immutable event ID, mutable display name, enabled state, same-day start/end window, and non-negative rate multiplier. Enabled windows cannot overlap. Policy replacement requires optimistic version matching and an idempotency key. The portal displays the server timezone, active and upcoming events, and the effective rate without trying to infer policy from the current clock alone.

sub2api freezes the applied policy version/hash, resolved base multiplier, event identity/rate when present, and final effective billing multiplier with each usage row at the request's pricing instant. Editing a policy never rewrites historical attribution. Legacy rows without attribution remain explicitly unknown.

### 5.6 Usage Tracking Before Settlement

The portal ingests sub2api usage by stable usage-log ID and retains:

- sub2api account ID;
- sub2api user ID;
- API key ID and group ID;
- model and request type;
- token counts;
- `total_cost`, `actual_cost`, and `account_stats_cost` when present;
- immutable Happy Hour pricing attribution when present, including policy version/hash, timezone, resolved base multiplier, applied event identity/rate, and effective billed multiplier;
- usage creation time and source update metadata.

Allocation weight uses the standardized upstream cost fact. It is dimensionless evidence for allocation and is never synchronized with or posted to the HKD ledger:

```text
usage_weight = account_stats_cost if present, otherwise total_cost
```

It must not use `actual_cost` as the allocation weight because user/group multipliers would distort relative consumption. Raw token counts remain visible as supporting detail.

Happy Hour changes the user's sub2api charge evidence and may make a request free, but it does not change the underlying carpool consumption weight, purchase-principal allocation, service fee, or amount due. The UI labels discounted charge evidence separately and never presents it as settlement principal.

While the account is active, the portal updates usage weights, ratios, token totals, and canonical ChatGPT 7-day progress. It does not calculate principal, service fees, amount due, or an estimated payable balance. Finalized settlement lines do not change unless an admin reopens the settlement with a reason.

### 5.7 Settlement Trigger And Formula

The portal calculates amounts only after one of these authoritative terminal triggers:

1. sub2api records that the managed ChatGPT account was blocked or disabled by the system; or
2. sub2api reports `codex_7d_used_percent >= 100` for the current, unexpired 7-day window.

The 7-day exhaustion observation is valid only when `codex_usage_updated_at` is fresh, `codex_7d_reset_at` is in the future at observation time, and the account is the attached paid ChatGPT subscription. A generic 429, a 5-hour limit, `schedulable=false`, temporary rate limiting, token refresh, proxy quarantine, or a manual pause is not a settlement trigger.

When a trigger is detected, the portal atomically changes the carpool to `settlement_triggered`, stops new joins and API-key provisioning, and asks sub2api to install an account-scoped terminal fence. The fence blocks every later HTTP/SSE/WebSocket admission and waits for every request admitted before the fence to complete and durably persist its usage. Only then may sub2api return one immutable usage high-water mark. The portal ingests the bounded usage feed exactly through that mark before it executes the formula below. The calculation covers the account lifecycle from `carpool.activated_at` through the terminal high-water mark and allocates the full recorded purchase principal.

The fence fails closed. Unknown or degraded in-flight tracking, usage persistence, database state, or reconciliation state cannot be treated as zero activity and cannot produce a ready watermark. A fence survives restart and never silently reopens the account.

If the terminal signal is incomplete or ambiguous, the portal opens an action item and does not calculate. An exceptional forced terminal event requires an operator reason plus finance-admin approval and is never the normal closing path.

All rates and exchange values are snapshotted onto the purchase and settlement. Monetary values are stored as integer minor units; ratios use fixed-precision decimals.

Definitions for one terminal ChatGPT account lifecycle settlement:

```text
P       = full recorded purchase principal for this account lifecycle in HKD minor units
N       = number of approved, activated chargeable participants
r_idle  = unused-seat rate, default 0.35
r_fee   = service-fee rate, default 0.05
U_i     = participant i usage weight during their active interval
```

All activated non-operator participants are chargeable. The operator is included in `N` only when explicitly enrolled and their usage weight is greater than zero. The operator never receives an unused-seat charge. If the operator did not use the account, the operator has no allocation and the other participant principal still sums to `P`.

For every participant with zero usage:

```text
idle_principal_i = r_idle * (P / N)
```

This interprets the 35% rule as 35% of that participant's equal-seat baseline, not 35% of the entire account per idle participant. That prevents multiple idle participants from over-collecting the purchase cost.

Then:

```text
idle_total = sum(idle_principal_i)
remaining_principal = P - idle_total
active_usage_total = sum(U_i where U_i > 0)

usage_principal_i = remaining_principal * U_i / active_usage_total
principal_i = idle_principal_i + usage_principal_i
service_fee_i = 0 for the operator participant, otherwise principal_i * r_fee
amount_due_i = 0 for the operator participant, otherwise principal_i + service_fee_i + adjustments_i - payments_i
```

Rounding uses largest-remainder allocation at the minor-unit level so:

```text
sum(principal_i) == P
```

The service fee is calculated after principal rounding and is operator revenue. It is not redistributed as principal. An operator-participant's principal is shown as owner contribution and does not create a receivable or a service fee payable to themselves.

Example with `P=HK$100`, three participants, usage weights 60, 40, and 0, idle rate 35%, and fee rate 5%:

```text
Idle participant principal: 0.35 * (100 / 3) = 11.67
Remaining principal: 88.33
60-weight participant principal: 53.00
40-weight participant principal: 35.33
Principals total: 100.00
Service fees: 2.65, 1.77, 0.58
Participant charges total: 105.00
```

If every participant has zero usage, automatic finalization is blocked. The operator chooses one of: equal split, cancel/refund, extend the period, or a reasoned manual allocation.

### 5.8 Payments And Balance

The participant dashboard shows:

- active usage ratio and 7-day progress without a payable estimate;
- finalized unpaid amount;
- overdue amount;
- payments pending confirmation;
- credits;
- net outstanding balance;
- due dates and statement history.

The operator can:

- record a payment with date, amount, method, reference, and optional evidence;
- mark it confirmed, rejected, refunded, or void;
- apply it to one or more statements;
- add a debit or credit adjustment with a mandatory reason;
- set a due date or payment reminder;
- search by current or historical normalized email.

An admin must never directly overwrite a computed balance. “Update balance” is implemented as an append-only adjustment entry. The immutable identity key is `(instance_id, sub2api_user_id)`; email is a searchable, versioned contact attribute rather than the primary key.

### 5.9 Trigger-driven Closing And Reconciliation

After an authoritative terminal trigger, closing a carpool:

1. Persists the immutable trigger type, source event ID, observed account state, 7-day snapshot, and trigger time.
2. Pauses new memberships and removes further member access.
3. Installs the sub2api terminal fence, rejects new HTTP/SSE/WebSocket admissions, waits for all pre-fence work to durably persist usage, receives the immutable high-water usage cursor, and ingests with that fixed `through_id`.
4. Produces the first payable settlement preview for that account lifecycle.
5. Requires resolution of unmatched usage and zero-usage exceptions.
6. Finalizes statements and ledger entries in one transaction.
7. Restores or detaches member API-key group assignments.
8. Keeps the terminal sub2api account unschedulable and moves it according to the configured disposition.

## 6. User Experience

### Participant Navigation

Use a desktop top navigation with grouped dropdowns and a mobile hamburger menu:

- Overview
- Shared: Marketplace, My Carpools, Requests
- Usage: Live Usage, Statements
- Account: Payments, Profile

### Admin Navigation

Use a fixed, independently scrolling admin sidebar:

- Overview
- Action Center
- Intake & Purchases
- Carpools
- Requests & Members
- Settlements
- Payments & Ledger
- Supplier Market
- Integrations
- Reconciliation
- Audit Log
- Settings

### Required Screens

Participant screens:

- dashboard with outstanding balance and active-carpool summary;
- public carpool marketplace;
- create/request/join flow;
- carpool detail with account status, usage ratio, 7-day progress, policy snapshot, terminal state, and finalized amount only after settlement;
- statements and payment history;
- profile and linked sub2api identity.

Admin screens:

- operational dashboard with pending intake, stale integrations, unpaid balance, and sync health;
- action center with durable tasks;
- ungrouped account intake and purchase-price modal;
- purchase and account detail;
- carpool builder and lifecycle management;
- request approval queue and membership management;
- settlement preview, exception resolution, finalization, and reopen flow;
- payments, allocation, refunds, and adjustments;
- nvtokens price board and merchant ranking history;
- integration credential health;
- sync-job and dead-letter inspector;
- audit log and exports;
- policy and notification settings.

### Visual Contract

Match the current sub2api redesign:

- Vue 3 and TypeScript;
- rice-yellow canvas `#f8f2d8`;
- near-white surface `#fffdf5`;
- forest green brand `#276b53`, strong `#205644`;
- Sora Variable for English;
- Noto Serif SC/TC Variable for Chinese;
- 10px controls, 12px panels, and restrained depth shadows;
- native semantic buttons, inputs, checkboxes, tables, dialogs, and focus states;
- blurred sticky navigation and floating overlays only where hierarchy requires them;
- 160-300ms motion with `prefers-reduced-motion` support;
- no decorative gradients, dots, blobs, oversized marketing hero, nested cards, or excessive glass effects;
- all financial values use tabular numerals and never rely on color alone.

## 7. Operator Settings

- fixed HKD currency name, `HK$` symbol, two decimals, and rounding mode;
- source-currency to HKD conversion rate and effective timestamp;
- service-fee default and per-carpool override;
- unused-seat default and per-carpool override;
- statement due period and reminder schedule;
- account detection interval and reconciliation interval;
- auto-claim enabled/disabled;
- account activation policy;
- terminal allocation policy, fixed to the full recorded purchase principal for the first release;
- public marketplace defaults and seat limits;
- notification email/webhook settings;
- data retention and export settings;
- role assignments and approval thresholds;
- maintenance mode and read-only finance mode.

## 8. Non-goals For The First Release

- Charging cards or bank accounts automatically.
- Replacing sub2api's prepaid balance or payment system.
- Buying supplier accounts automatically.
- Storing raw sub2api passwords or API-key secrets.
- Direct database access to sub2api.
- Automated settlement of disputed or unmatched usage.
- Supporting multiple unrelated suppliers before the nvtokens adapter is stable.

## 9. Product Acceptance Criteria

- A supplier-pushed, paid ChatGPT subscription account with no groups produces exactly one durable intake item; other ungrouped accounts produce none.
- The account cannot serve requests before purchase details and activation are complete.
- An approved waiting request remains hidden from accounting until account attachment and activation.
- A public carpool can accept join requests, but access is provisioned only after approval.
- Usage is attributed only inside membership active intervals and only for attached account IDs.
- An active account shows usage ratios and 7-day progress but no calculated payable amount.
- A fresh canonical 7-day utilization of 100%, or a system-originated blocked/disabled account event, creates exactly one settlement trigger.
- A 5-hour exhaustion, generic 429, temporary unschedulability, or manual pause never creates a settlement trigger.
- The payable calculation includes usage only through the trigger's immutable drained high-water mark and runs only after a fail-closed terminal fence is ready and bounded ingestion has consumed that exact mark.
- A request admitted before the fence cannot be omitted merely because its HTTP/SSE/WebSocket response or batched usage persistence completes after terminal detection.
- Replaying supplier, account, or usage sync does not duplicate records or charges.
- The settlement principal always equals the allocated purchase principal to the minor unit.
- An idle participant receives the snapshotted unused-seat treatment.
- The operator is not allocated principal when not enrolled/using the account.
- Service fees are visible separately from principal.
- Marking a payment or adjusting a balance creates ledger and audit entries rather than rewriting history.
- Users see only their own amounts and usage; admins see data allowed by their role.
- The interface meets the visual contract on desktop and mobile and passes reduced-motion and keyboard checks.
# Scoped Discovery Contract

The portal may poll only the scoped `state=ungrouped` account discovery endpoint. Responses are redacted to the account ID, account version, fixed paid classification, schedulable flag, and timestamps. Workers must treat results as advisory and restart a completed cursor scan at `after_id=0`; claim is the sole ownership authority and handles races.

Discovery is per-portal throttled, audited without bearer material, and cannot expose account credentials, plan tier, proxy, account name, owner, or metadata. The same eligibility conditions are revalidated atomically when claiming and scheduler invalidation is committed with the claim.
