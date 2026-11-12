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
| fruits | `POST /fruits` | implemented (PR #6) | UI flag `v2` merges after BE deploy |
| fruits | `PATCH /fruits/:id` | implemented (PR #6) | same |
| fruits | `DELETE /fruits/:id` | implemented (PR #6) | same |
| cups | `GET /cups` | implemented | UI flag not added yet |
| cups | `POST /cups` | implemented | no UI screen |
| cups | `PUT /cups/:id` | implemented | no UI screen; fixes cross-user update |
| cups | `DELETE /cups/:id` | implemented | no UI screen |
| cupCosts | `GET /cupCosts` | not started | |
| cupCosts | `POST /cupCosts` | not started | |
| cupCosts | `PUT /cupCosts/:id` | not started | |
| cupCosts | `DELETE /cupCosts/:id` | not started | |
| cupValues | `GET /cupValues` | not started | |
| cupValues | `POST /cupValues` | not started | |
| cupValues | `PUT /cupValues/:id` | not started | |
| cupValues | `DELETE /cupValues/:id` | not started | |
| constants | `GET /constants/:id` | not started | no list route; UI uses hard-coded ids |
| constants | `PATCH /constants/:id` | not started | |
| orders | `GET /orders` | not started | |
| orders | `GET /orders/:id` | not started | |
| orders | `POST /orders` | not started | |
| orders | `PUT /orders/:id` | not started | |
| orders | `DELETE /orders/:id` | not started | |
| inventory | `GET /inventory` | not started | |
| inventory | `GET /inventory/overview` | not started | |
| inventory | `POST /inventory/input` | not started | |
| transactions | `GET /transactions` | not started | |
| transactions | `GET /transactions/:id` | not started | |
| transactions | `POST /transactions` | not started | |
| transactions | `PUT /transactions/:id` | not started | |
| transactions | `DELETE /transactions/:id` | not started | route is wired to a handler named `updateTransaction` (v1 `transaction.routes.ts`); verify in analysis |
| bouquets | `GET /bouquets` | not started | |
| bouquets | `GET /bouquets/:id` | not started | |
| bouquets | `POST /bouquets` | not started | |
| bouquets | `PUT /bouquets/:id` | not started | |
| tomatoes | `GET /tomatoes/cups` | implemented (PR #9) | UI flag `v2`: UI PR #44, merges after BE deploy |
| tomatoes | `GET /tomatoes/totals` | implemented (PR #9) | same |
| tomatoes | `GET /tomatoes/transactions` | implemented (PR #9) | same |
| tomatoes | `GET /tomatoes/transactions/:id` | implemented (PR #9) | same |
| tomatoes | `POST /tomatoes/transactions` | implemented (PR #9) | same |
| tomatoes | `PUT /tomatoes/transactions/:id` | implemented (PR #9) | same |
| tomatoes | `DELETE /tomatoes/transactions/:id` | implemented (PR #9) | same |
| tomatoes | `GET /tomatoes` | implemented (PR #9) | same |
| tomatoes | `GET /tomatoes/:id` | implemented (PR #9) | same |
| tomatoes | `POST /tomatoes` | implemented (PR #9) | same |
| tomatoes | `PUT /tomatoes/:id` | implemented (PR #9) | same |
| tomatoes | `DELETE /tomatoes/:id` | implemented (PR #9) | same |

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

## cupCosts

### GET /cupCosts
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /cupCosts
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /cupCosts/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /cupCosts/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## cupValues

### GET /cupValues
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /cupValues
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /cupValues/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /cupValues/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## constants

### GET /constants/:id
- **Analysis:** not done (note: there is no list route, the UI reads constants by hard-coded ids)
- **Decisions:** -
- **Open questions:** -

### PATCH /constants/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## orders

### GET /orders
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /orders/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /orders
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /orders/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /orders/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## inventory

### GET /inventory
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /inventory/overview
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /inventory/input
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## transactions

### GET /transactions
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /transactions
- **Analysis:** not done (known: transaction + inventory update are not atomic, see known-issues.md)
- **Decisions:** -
- **Open questions:** -

### PUT /transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /transactions/:id
- **Analysis:** not done (the route uses a handler named `updateTransaction`; verify what it really does)
- **Decisions:** -
- **Open questions:** -

## bouquets

### GET /bouquets
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /bouquets/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /bouquets
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /bouquets/:id
- **Analysis:** not done (a DELETE route exists only as a commented-out line)
- **Decisions:** -
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
