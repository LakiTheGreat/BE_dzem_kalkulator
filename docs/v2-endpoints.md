# v2 endpoint tracker

One place for every endpoint: where it stands, what was analysed, what was decided, what is still open. Plan and rules: [v2-migration.md](v2-migration.md). How to migrate: skill `api-v2-migration`.

**Rule: analysis comes first.** Before any implementation, fill in *Analysis* for the endpoint (v1 code, bugs, improvements, disputed points). Disputed points go to the owner one question at a time; record the answer under *Decisions*. Only then implement.

Stages: `not started` -> `analysed` -> `decided` -> `implemented` -> `UI on v2`.
Contract (routes, status codes, response shape) stays the same and the UI is not changed unless explicitly agreed.

## Overview

All paths are relative to `/api` (v1) and `/api/v2` (v2).

| Resource | Endpoint | Stage | Notes |
|---|---|---|---|
| auth | `POST /auth/login` | not started | |
| fruits | `GET /fruits` | UI on v2 | |
| fruits | `POST /fruits` | UI on v2 | |
| fruits | `PATCH /fruits/:id` | UI on v2 | |
| fruits | `DELETE /fruits/:id` | UI on v2 | |
| cups | `GET /cups` | UI on v2 | |
| cups | `POST /cups` | implemented | no UI screen |
| cups | `PUT /cups/:id` | implemented | no UI screen; fixes cross-user update |
| cups | `DELETE /cups/:id` | implemented | no UI screen |
| cupCosts | `GET /cupCosts` | UI on v2 | |
| cupCosts | `POST /cupCosts` | implemented | no UI screen |
| cupCosts | `PUT /cupCosts/:id` | UI on v2 | |
| cupCosts | `DELETE /cupCosts/:id` | implemented | no UI screen |
| cupValues | `GET /cupValues` | UI on v2 | |
| cupValues | `POST /cupValues` | implemented | no UI screen |
| cupValues | `PUT /cupValues/:id` | UI on v2 | |
| cupValues | `DELETE /cupValues/:id` | implemented | no UI screen |
| constants | `GET /constants/:id` | UI on v2 | no list route; UI uses hard-coded ids; UI PR #48 |
| constants | `PATCH /constants/:id` | UI on v2 | `isDeleted` no longer accepted; UI PR #48 |
| orders | `GET /orders` | UI on v2 | one block with inventory + transactions, see [v2-orders-plan.md](v2-orders-plan.md) |
| orders | `GET /orders/:id` | UI on v2 | same |
| orders | `POST /orders` | UI on v2 | same |
| orders | `PUT /orders/:id` | UI on v2 | same |
| orders | `DELETE /orders/:id` | UI on v2 | same |
| inventory | `GET /inventory` | UI on v2 | derived stock |
| inventory | `GET /inventory/overview` | UI on v2 | derived stock |
| inventory | `POST /inventory/input` | UI on v2 | writes a correction row (new table) |
| transactions | `GET /transactions` | UI on v2 | |
| transactions | `GET /transactions/:id` | UI on v2 | |
| transactions | `POST /transactions` | UI on v2 | |
| transactions | `PUT /transactions/:id` | UI on v2 | |
| transactions | `DELETE /transactions/:id` | UI on v2 | v1 route is wired to `updateTransaction` (soft delete only when body has `isDeleted: true`) |
| bouquets | `GET /bouquets` | UI on v2 | UI PR #53 |
| bouquets | `GET /bouquets/:id` | UI on v2 | UI PR #53 |
| bouquets | `POST /bouquets` | UI on v2 | UI PR #53 |
| bouquets | `PUT /bouquets/:id` | UI on v2 | UI PR #53 |
| tomatoes | `GET /tomatoes/cups` | UI on v2 | UI PR #44 |
| tomatoes | `GET /tomatoes/totals` | UI on v2 | same |
| tomatoes | `GET /tomatoes/transactions` | UI on v2 | same |
| tomatoes | `GET /tomatoes/transactions/:id` | UI on v2 | same |
| tomatoes | `POST /tomatoes/transactions` | UI on v2 | same |
| tomatoes | `PUT /tomatoes/transactions/:id` | UI on v2 | same |
| tomatoes | `DELETE /tomatoes/transactions/:id` | UI on v2 | same |
| tomatoes | `GET /tomatoes` | UI on v2 | same |
| tomatoes | `GET /tomatoes/:id` | UI on v2 | same |
| tomatoes | `POST /tomatoes` | UI on v2 | same |
| tomatoes | `PUT /tomatoes/:id` | UI on v2 | same |
| tomatoes | `DELETE /tomatoes/:id` | UI on v2 | same |

## Cross-cutting

### Auth middleware (v2 `mockAuth`)
- **Decisions:** same responses as v1 (401 without header, 404 unknown user); stops after the 401 (v1 sent a second response and logged "Cannot set headers after they are sent").

## auth

### POST /auth/login
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## fruits

### GET /fruits
- **Analysis:** v1 had a dead `!fruits` check and read the user from the raw header.
- **Decisions:** same contract as v1 (array of non-deleted fruits of the user, sorted by label); user from `req.user.id`; dead code removed.
- **Open questions:** none.

### POST /fruits
- **Analysis:** v1 validates before trimming, messages mention `value`, duplicate suffix is count-based, counts deleted fruits, uses an unescaped regex built from user input, has unreachable `if (!fruit) throw 500`.
- **Decisions:**
  - Trim first, then validate (`"  ab "` -> 400, whitespace-only -> 400).
  - Validation messages mention `label`.
  - Duplicate suffix = highest used suffix + 1 (plain label counts as 1), deleted fruits ignored, regex escaped; never collides.
  - Response unchanged: 201 + fruit.
- **Open questions:** concurrent POSTs with the same label can still duplicate (no unique constraint); see v2-migration.md.

### PATCH /fruits/:id
- **Analysis:** same suffix bugs as POST; renaming to the fruit's own name could collide with `"A (2)"`; works on deleted fruits; missing fruit gives 400 `PRISMA_P2025` by accident; id check lets `0`, `-1`, `1.5` through.
- **Decisions:**
  - Same label rules as POST; the fruit itself is excluded when looking for a free label.
  - Deleted or missing fruit -> 404 `Voće nije pronađeno` (invalid id -> 400 `Neispravan ID voća`; Serbian per the error-message standard).
  - Id must be an integer >= 1, otherwise 400 `Neispravan ID voća`.
  - Response unchanged: 200 + fruit.
- **Open questions:** none.

### DELETE /fruits/:id
- **Analysis:** soft delete; deleting an already deleted fruit returned 200 again; missing fruit gave 400 `PRISMA_P2025`.
- **Decisions:**
  - Deleted or missing fruit -> 404.
  - Same id validation as PATCH.
  - One atomic `updateMany`; response unchanged: 200 `{ message: 'Voće je obrisano', fruit }`.
- **Open questions:** none.

## cups

UI uses only `GET /cups` (no screens for create/update/delete of cups).

### GET /cups
- **Analysis:** v1 had a dead `!cups` check, a `?.`/`?? null` on required relations, user from the raw header; swagger shows nested cost/price objects but the response is flat numbers.
- **Decisions:** same contract (non-deleted cups of the user sorted by label, `{ id, label, isDeleted, cost, sellingPrice }` with numbers); mapping moved to the service.
- **Open questions:** none.

### POST /cups
- **Analysis:** v1 connected any `costId`/`valueId` (another user's, deleted, or missing -> 400 `PRISMA_P2025`), validated the label before trimming, unreachable `!cup` 500.
- **Decisions:**
  - Cost and price must exist, be non-deleted and belong to the user, otherwise 404 (`Trošak tegle nije pronađen` / `Cena tegle nije pronađena`), same as v1 PUT.
  - Trim first, then validate.
  - Response unchanged: 201 + cup with nested `cost` and `sellingPrice` (differs from the flat GET shape, as in v1).
- **Open questions:** duplicate labels are still allowed (as in v1).

### PUT /cups/:id
- **Analysis:** v1 `update` had `where: { id }` without `userId` and re-assigned `user` -> **any user could change another user's cup and take it over**; deleted cups could be updated; missing cup -> 400 `PRISMA_P2025`; id check let `0`, `-1`, `1.5` through; redundant `!label || !costId || !valueId` check.
- **Decisions:**
  - Cup must exist, be non-deleted and belong to the user, otherwise 404 `Tegla nije pronađena`; ownership is never changed.
  - Id must be an integer >= 1, otherwise 400 `Neispravan ID tegle`.
  - Same cost/price checks as POST. All three fields stay required.
  - Response unchanged: 200 `{ message: 'Tegla je izmenjena', updatedCup }`.
- **Open questions:** none.

### DELETE /cups/:id
- **Analysis:** soft delete; already deleted cup returned 200 again; missing cup gave 400 `PRISMA_P2025` (swagger said 404).
- **Decisions:** missing, deleted or foreign cup -> 404; id validation as PUT; one atomic `updateMany`; response unchanged: 200 `{ message: 'Tegla je obrisana', cup }`.
- **Open questions:** deleting a cup that is still used by orders/transactions is allowed (soft delete, history keeps the reference), as in v1.

## cupCosts and cupValues

Both resources are identical in shape (`label` + `value`), so they share one analysis and one validation schema (`cupPriceSchema`). Tests: `tests/cupPrices.test.ts`.

### GET / POST / PUT / DELETE (`/cupCosts`, `/cupValues`)
- **Analysis (v1 bugs):**
  - DELETE controller called the service without `await` (response body `{}`, a Prisma P2025 became an unhandled rejection that can crash Node 22).
  - cupValue POST did not `await` the service (201 with empty `{}`).
  - cupValue PUT sent a 400 for a NaN id without `return`/throw (possible double response); PUT guard used `!value && !label` instead of OR.
  - Not-found surfaced as 400 `PRISMA_P2025`; update/delete also worked on already deleted rows.
  - `isNaN` id check let `0`, `-1`, `1.5` through; dead `!x` 404/500 branches.
  - Deleting a cost/price used by active cups was allowed (cups kept pointing at a deleted row).
  - v1 PUT/DELETE were already scoped by `userId` (unlike cups PUT).
- **Decisions:**
  - Contract kept: GET returns an array, POST 201, PUT `{message, updatedCupCost|updatedCupValue}`, DELETE `{message, deletedCupCost|deletedCupValue}`.
  - POST returns the created row (v1 cupValue returned `{}`).
  - Missing/deleted/foreign row on PUT/DELETE: 404 (`Trošak tegle nije pronađen` / `Cena tegle nije pronađena`); invalid id: 400 (`Neispravan ID troška` / `Neispravan ID cene`); label is trimmed before length validation.
  - **Owner decision:** deleting a cost/price used by active (non-deleted) cups is blocked with 400 (`Trošak se koristi u aktivnim teglama` / `Cena se koristi u aktivnim teglama`). v1 allowed it.
  - Messages in Serbian (v2 standard).
- **Open questions:** none.

## constants

No list route; the UI reads constants by hard-coded ids (user 1: 3, 4, 6, 8; real user: 1, 2, 5, 7) and only edits `value` + `label` (`"<value>%"`). Tests: `tests/constants.test.ts`.

### GET /constants/:id
- **Analysis (v1 bugs):** returned soft-deleted constants; English message `Constant not found`; id not validated (`abc` -> NaN -> Prisma 500).
- **Decisions:** same contract (200 + the row); missing/deleted/foreign -> 404 `Konstanta nije pronađena`; id must be an integer >= 1, otherwise 400 `Neispravan ID konstante`. Note: UI URLs have a trailing space (`/constants/2 `), `Number()` trims it, so this keeps working.
- **Open questions:** none.

### PATCH /constants/:id
- **Analysis (v1 bugs):** validator allowed floats (`1.5`) and numeric strings while the column is `Int` -> Prisma error 500; id not validated; updated deleted rows; check-then-update (two queries); `isDeleted` in the body could soft-delete a constant (UI never sends it); label not trimmed; dead `!updated` 500 branch.
- **Decisions:**
  - `value` must be an integer >= 1, `label` a non-empty trimmed string (both required, as in v1).
  - **Owner decision:** `isDeleted` is removed from PATCH (ignored); soft-deleted constants give 404.
  - One atomic `updateMany` scoped by `userId` and `isDeleted: false`; response unchanged (200 + updated row).
- **Open questions:** none.

## orders

Orders are coupled to the `Inventory` stock counter, so they have a separate plan: [v2-orders-plan.md](v2-orders-plan.md). Per-endpoint analysis below follows from it.

### GET /orders
- **Analysis:** v1 audit in the plan (items 12, 14). Filters `orderTypeId`, `priceStatus` (1/2), `year`, `month` are validated; totals and per-order value/expense/profit/margin are computed on the server. Findings: `fruitName` is `'Unknown'` for deleted fruits; date range uses server-local time; totals logic sits in the controller; English messages.
- **Decisions:** same query params and response shape (`orders[]`, `totalValue`, `totalExpense`, `totalProfit`, `totalCups`, `profitMargin` as `"N%"`); calculation moves to the service; fruit names come from all of the user's fruits including deleted ones so history keeps its names (to confirm in review if unwanted); Serbian messages for invalid query params.
- **Open questions:** none.

### GET /orders/:id
- **Analysis:** raw row + `orderType`, different shape from list items (UI edit form depends on it). `findUnique` with `isDeleted: false` and `userId` is already correct; 404 `Order not found`.
- **Decisions:** shape unchanged; invalid id 400 `Neispravan ID`; missing or deleted 404 `Serija nije pronađena`.
- **Open questions:** none.

### POST /orders
- **Analysis:** plan items 1, 2, 6, 8, 9: order and counter written separately; required-field check after lookups; client-sent amounts stored as is; no check of `fruitId`; 0/negative/duplicate cups accepted.
- **Decisions:** validation per plan Decisions (`numberOf` integer >= 1, `cups` non-empty with unique ids, `fruits` non-empty, `baseFruitIsFree` boolean required, margin 1..100, amounts numbers >= 0 and required, unknown/foreign `orderTypeId`, `fruitId` or cup id rejected). Only the order row is written (stock is derived); response 201 + row. `userId`, `isDeleted`, `id` from the body are ignored.
- **Open questions:** none.

### PUT /orders/:id
- **Analysis:** plan items 3, 4, 5, 11 and the margin overwrite from the UI.
- **Decisions:** one `updateMany` scoped by `userId` and `isDeleted: false` inside a DB transaction, then `findUniqueOrThrow`; `otherExpensesMargin` is **not** changed (owner decision); same validation as POST; reducing cups, removing a cup or changing the fruit that would push stock below 0 gives 400 `Nema dovoljno tegli na stanju` and changes nothing. Response 200 + updated row.
- **Open questions:** none.

### DELETE /orders/:id
- **Analysis:** v1 subtracts from the counter with clamping at 0 and skips when no counter row exists; duplicate `!existingOrder` check; update without `isDeleted` filter.
- **Decisions:** atomic soft delete (`updateMany` with `isDeleted: false`); rejected with 400 `Nema dovoljno tegli na stanju` if stock would go below 0; response 200 `{ message }` kept (Serbian text); missing/deleted 404.
- **Open questions:** none.

## inventory

**Resource-wide analysis.** v1 stock is the `Inventory` JSON counter (one row per fruit, `cupData: [{ cupId, quantity }]`), changed by orders, transactions and `POST /inventory/input`. v2 derives stock instead: per fruit and cup `SUM(order cups.numberOf) - SUM(abs(transaction cups.quantity)) + SUM(corrections)`, non-deleted rows only, computed in one shared stock service used by orders, transactions and inventory. The `Inventory` table is kept untouched for v1 (rollback); it goes stale while v2 is used. New table for corrections (additive Prisma migration): `InventoryCorrection` (`id`, `userId`, `orderTypeId`, `cupId`, `quantity`, `createdAt`, `isDeleted`).

### GET /inventory
- **Analysis:** v1 groups the counter by fruit with cup labels sorted by the number in the label, fruits sorted by label; 404 `No inventory found for user` when empty; labels `null` for deleted fruits/cups.
- **Decisions:** same response (`[{ orderTypeId, label, cups: [{ cupId, label, numberOf }] }]`) built from derived stock; empty result stays 404 with a Serbian message (UI contract; to verify with the UI when implementing).
- **Open questions:** none.

### GET /inventory/overview
- **Analysis:** v1 sums the counter over all fruits per cup and lists every non-deleted cup (0 if none), sorted by the number in the label (`NaN` if a label has no number).
- **Decisions:** same response (`[{ label, numberOf }]`) from derived stock; sorting made NaN-safe.
- **Open questions:** none.

### POST /inventory/input
- **Analysis:** v1 upsert of the counter (creates or adds, negative allowed, no stock check, not atomic, `cupData` items for several cups in one call). UI sends one item with a possibly negative `quantity` after a client-side password check (the server does not check it).
- **Decisions:** same route and request (`orderTypeId`, `cupData[{ cupId, quantity }]`, `quantity` integer and not 0); writes one correction row per item in a DB transaction; a correction that would push stock below 0 gives 400 `Nema dovoljno tegli na stanju`; unknown/foreign fruit or cup rejected; 201 with the created corrections. The password stays an auth/security topic, not changed here.
- **Open questions:** none.

## transactions

**Resource-wide analysis.** Findings are in the plan (banana -> pineapple bug, missing `return` after soft delete, non-atomic writes, sign trusted from the client, first transaction of a fruit returns the inventory row). Also: `DELETE /:id` is wired to `updateTransaction`, so deleting works only because the UI sends `{ isDeleted: true }`; without it the call is treated as an update with a missing body. `deleteTransaction` in the controller is an unused copy of update. `getTransactionByIdService` returns deleted rows; list loads cup labels without scoping by user.

### GET /transactions
- **Analysis:** filters `orderTypeId`, `transactionStatus` (not validated: bad value -> Prisma error 500), `year`, `month`.
- **Decisions:** same response; `transactionStatus` validated against the enum (`ALL` treated as no filter is a UI concern, UI does not send it); cup labels scoped by user; Serbian messages.
- **Open questions:** none.

### GET /transactions/:id
- **Analysis:** raw row, deleted rows are returned.
- **Decisions:** shape unchanged (stored negative `quantity`, UI uses `Math.abs`); deleted/missing 404 `Transakcija nije pronađena`; invalid id 400.
- **Open questions:** none.

### POST /transactions
- **Analysis:** see plan; also `note` is not validated as a string (defaults to `""` in the DB).
- **Decisions:** quantity normalised to negative, `0` rejected, unique cup ids, non-empty `cupData`, fruit and cups must belong to the user; transaction row written inside a DB transaction together with the stock check (400 `Nema dovoljno tegli na stanju`); always 201 + transaction row.
- **Open questions:** none.

### PUT /transactions/:id
- **Analysis:** banana -> pineapple bug; the soft delete via PUT body `isDeleted` is a v1 quirk used only by DELETE.
- **Decisions:** only updates `orderTypeId`, `status`, `cupData`, `note`; `isDeleted` is ignored; atomic `updateMany` with `isDeleted: false`; stock check on both the old and new fruit (old stock is given back automatically because stock is derived); 200 + updated row.
- **Open questions:** none.

### DELETE /transactions/:id
- **Analysis:** see resource-wide analysis.
- **Decisions:** plain atomic soft delete in v2 (body ignored); response 200 `{ message }` (v1 message was `Transaction soft deleted`, Serbian text in v2); 404 for missing/deleted. Deleting a transaction only adds stock back, so no stock check.
- **Open questions:** none.

## bouquets

**Resource-wide analysis (v1 audit).** Model `BouquetTransaction` (`status` SOLD/GIVEN_AWAY/PROMOTION/OTHER, `totalExpense`, `income`, `profit`, `profitMargin`, `note`, soft delete). Client sends `profit` and `profitMargin`; the server stores them without checking. There is no DELETE route: the UI deletes via `PUT` with `isDeleted: true` (UI `BouquetPage/index.tsx`), so that must stay.
Findings in v1:
- user read from raw `x-user-id` header; `userId || 1` fallback in create (a missing user silently becomes user 1);
- `GET /:id` uses `findUnique({ id, userId })` without `isDeleted: false`, so deleted rows are returned;
- `PUT` also ignores `isDeleted`: deleted rows can be edited and restored; not found gives Prisma P2025 -> 400 via the error handler, the `!updatedTransaction` 404 is dead code; the response lacks `status` (GET/POST include it);
- `POST` has a dead `!bouquetTransaction` check and returns the whole row including `userId` (GET/PUT hide it);
- list: `transactionStatus` query is not validated (a bad value hits Prisma -> 500); `whereClause: any`, `userId`/`isDeleted` duplicated in controller and service;
- validation: `isIn` options contain a sparse array (`[[, 'SOLD', ...]]`); schema accepts an unused `userId` body field; swagger says partial update but all fields are required; messages in English.

### GET /bouquets
- **Analysis:** see resource-wide analysis (unvalidated `transactionStatus`, duplicated where).
- **Decisions:** same contract; unknown `transactionStatus` -> 400 (v1: 500); response shape shared with all bouquet endpoints (no `userId`).
- **Open questions:** -

### GET /bouquets/:id
- **Analysis:** returns deleted rows; English messages.
- **Decisions:** deleted rows -> 404 (owner decision); invalid id -> 400; Serbian messages.
- **Open questions:** -

### POST /bouquets
- **Analysis:** `userId || 1` fallback, dead check, `userId` in response.
- **Decisions:** 200 + row as in v1 but without `userId` (owner decision); user from `req.user.id`, no `|| 1` fallback; dead check removed. `profit`/`profitMargin` are still taken from the client (not recomputed).
- **Open questions:** -

### PUT /bouquets/:id
- **Analysis:** edits deleted rows, dead 404, no `status` in response; a DELETE route exists only as a commented-out line.
- **Decisions:** deleted rows cannot be edited or restored -> 404; missing id -> 404 (v1: 400 via P2025); `PUT` with `isDeleted: true` still soft-deletes (UI); response now includes `status` and has the shared shape; single atomic `updateMany`.
- **Open questions:** -
## tomatoes

**Resource-wide analysis (v1 audit).** Stock is derived, not stored: `totals` = SUM(orders.numOfCups) - SUM(transactions.numOfCups), non-deleted rows only. No counter table, so no drift; this design is kept.
- `PUT /tomatoes/:id`: validation requires `totalExpenses`, but the controller reads `totalExpense` and the service takes `totalExpense`, which is not a column. The expense is never updated (probably a Prisma error, to be confirmed by a test).
- `POST /tomatoes` returns 200 (every other create returns 201); has an unreachable `!tomatoOrder` check. Validation messages say `numOf` instead of `numOfCups`; `numOfCups` message says "non-negative" but min is 1; schema accepts `userId`/`isDeleted` from the body (ignored by the controller).
- `cupTypeId` is not checked on create/update (order or transaction): a cup of another user, a deleted cup or a missing cup (FK error) is accepted. Breaks the per-user scoping rule.
- `update`/`delete` use `update({ where: { id, userId } })`, which throws P2025 instead of returning `null`, so the 404 branches never run; updates and deletes also touch already-deleted rows. `DELETE /transactions/:id` has the message `'TomatoTransaction found'` on its 404.
- `GET /:id` and `GET /transactions/:id` return soft-deleted rows.
- Stock can go negative: transaction create/update and order update/delete never check the remaining stock.
- `GET /totals`: the date filter (`year`/`month`) applies to orders but not to transactions, so "remaining" is wrong whenever a filter is set; cup types that have transactions but no orders are missing from the result; cup labels are not scoped by user/`isDeleted`.
- Date filter (`year`/`month`) is copy-pasted in 3 controllers; no validation of `year`/`month`/`transactionStatus` (an invalid status gives a Prisma error -> 500/400 by accident); end date is `23:59:59` (misses the last second) and uses server timezone.
- `GET /transactions` maps with `cupType: undefined` (leftover); `include: { user: true }` in transaction create loads the whole user row for nothing.
- Everything reads `x-user-id` from the raw header instead of `req.user.id`.
- Not touched in v1: `TomatoCup` has no routes besides `GET /cups`.

**Decisions (owner, all endpoints; contract kept unless noted).**
- Negative stock is blocked: creating/updating a transaction, shrinking or deleting an order, or moving it to another cup type that would push stock below 0 gives 400 `Nema dovoljno tegli na stanju` and nothing is changed (checked inside a DB transaction; stock that was already negative may still recover).
- `GET /totals`: the `year`/`month` filter is dropped (the UI never sends it); stock is always the total. Cup types with only transactions are now included; labels scoped by user.
- Unknown / foreign `cupTypeId` on create/update -> 404 `Tegla nije pronađena`. Missing or deleted order/transaction -> 404 (`Serija nije pronađena`, `Transakcija nije pronađena`); invalid id (not an integer >= 1) -> 400 `Neispravan ID`; `GET /:id` no longer returns deleted rows. Messages are in Serbian (see Cross-cutting decisions in v2-migration.md); the UI shows them.
- `PUT /tomatoes/:id` now really updates `totalExpenses` and `cupTypeId` (v1 ignored both because of the `totalExpense` typo / missing field); needed because the UI edit form lets the user change them.
- `POST /tomatoes` keeps status 200 (not 201) so the contract does not change; `POST /tomatoes/transactions` stays 201 with the same response shape.
- Query validation (400): `year` >= 0, `month` 0-12 (0 or empty = no filter, as the UI sends), `transactionStatus` one of the enum. Month filter uses an exclusive upper bound (v1 missed the last second) and treats `year=0` as the current year.
- Validation messages fixed (`numOf` -> `numOfCups`); `userId`/`isDeleted` in the body are no longer accepted by the schema (v1 ignored them).
- Internal: user from `req.user.id`, writes in one DB transaction, soft delete of transactions via a single atomic `updateMany`, no `include: { user: true }`.
- **Open questions:** none. Concurrent requests can in theory still both pass the stock check (default isolation level); negligible for a single user.

### GET /tomatoes/cups
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/totals
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/transactions
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /tomatoes/transactions
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /tomatoes/transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /tomatoes/transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /tomatoes
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /tomatoes/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /tomatoes/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -
