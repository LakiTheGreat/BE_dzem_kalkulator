# Orders v2: plan

Separate plan for `orders`, because here the problem is bigger than in earlier resources. All general v2 rules still apply (see [v2-migration.md](v2-migration.md), skill `api-v2-migration`): existing API contract stays, Serbian messages, `req.user.id`, soft delete, analysis first, disputed points go to the owner one at a time. Status per endpoint stays in [v2-endpoints.md](v2-endpoints.md).

## The big problem: orders are coupled to jam stock

`POST`, `PUT` and `DELETE /orders` do not only write the order. They also change the `Inventory` row of the fruit (a JSON counter `cupData: [{ cupId, quantity }]`). `transactions` and `POST /inventory` change the same counter. So `orders`, `transactions` and `inventory` share one piece of state and cannot be migrated independently without deciding how stock works in v2.

Remaining order after this plan: **orders**, **transactions**, **inventory** (then auth). Orders cannot go to "UI on v2" alone if v2 stock is derived (see Decision A), because the UI would read stock that v2 orders no longer write.

### v1 audit (order + stock logic)

Data integrity:
1. Order write and inventory write are separate Prisma calls (no `prisma.$transaction`). A failure in between leaves the counter and the orders out of sync, and nothing repairs it.
2. `POST`: inventory is read, then created/updated from the read value (read-modify-write). Two concurrent requests lose an update; two concurrent first orders for a fruit hit the primary key (`orderTypeId`) and one gets a 500.
3. `PUT`: the diff is computed only over cups in the **new** list. A cup removed from the order is never subtracted from stock.
4. `PUT`: changing `orderTypeId` does not move stock. The diff is applied to the **new** fruit, the old fruit keeps the old quantity.
5. `PUT`/`DELETE` clamp stock at 0 (`if (quantity < 0) quantity = 0`), which silently hides drift instead of reporting it. If no inventory row exists, `PUT` creates one with a possibly negative diff, `DELETE` skips it.
6. `cups.*.numberOf` accepts 0 and negative numbers, so an "order" can reduce stock. Empty `cups` array and duplicate cup ids are accepted.
7. `Inventory` primary key is `orderTypeId` only (not `userId + orderTypeId`).

Validation / security:
8. `POST` checks `fruits`, `baseFruitIsFree` and `otherExpensesMargin` for `undefined` **after** the DB lookups, although the schema marks `fruits` and `baseFruitIsFree` optional. Omitting them gives 400 `Missing required fields`, which contradicts the schema.
9. Cup ids are checked against the user's cups, but `cups.*.label/cost/sellingPrice/total` come from the client and are stored as is (label can differ from the cup, `total` is not checked against `numberOf * cost`). `fruits.*.fruitId` is not checked against the user's fruits; `fruits.*.price` and `.total` validation is commented out, yet `GET` reads `Number(price)`/`Number(total)`.
10. `otherExpensesMargin` min is 1, so 0% is impossible (default in DB is 25).
11. `PUT` service updates by `{ id, userId }` without `isDeleted: false` and without an atomic check (404 is decided by an earlier read). `DELETE` does the same.
12. `GET /orders`: unknown fruit id gives `fruitName: 'Unknown'`; `fruitLookup` uses only non-deleted fruits. Date filter uses server-local time. `GET /orders/:id` returns the raw row (+ `orderType`), a different shape from the list items.
13. Messages are English; `DELETE` returns `200 { message }`; `POST` returns the raw row with 201.
14. `order.controller.ts` is ~25 KB mostly swagger; business logic (totals, profit, stock) lives in the controller.

Same class of bug in transactions (reported by the owner, confirmed in `transaction.controller.ts` `updateTransaction`): the update reads the inventory of the **new** `orderTypeId` only and applies old-vs-new cup diff there. Changing a transaction from banana to pineapple takes stock from pineapple, but the banana stock is never given back. Also, after the soft-delete branch there is no `return`, so the handler continues into the normal update path (second response / extra inventory change). Every place that mutates the counter has to remember all related rows, which is why this keeps breaking. This is the strongest argument for **A1 (derived stock)**: with no counter, changing the fruit of an order or transaction cannot leave stock wrong.

What is fine and should be kept: totals/profit/margin are computed on the server in `GET` (`orderValue`, `orderExpense`, `orderProfit`, `profitMargin` as `"N%"`, `totalCups`); the `Json[]` snapshot of cups/fruits (history does not change when prices change, see [domain.md](domain.md)).

## Decisions

- **Owner (2026-11-12): `PUT /orders/:id` keeps the order's existing `otherExpensesMargin`** (the value from the request is ignored on update; it is only used on create). The UI is not changed. Margin allowed range for create is decided in C.
- **Owner (2026-11-12): order cup `numberOf` must be an integer >= 1** (0 and negative rejected).
- **Owner (2026-11-12): order `cups` must have at least one item and each cup id only once.**
- **Owner (2026-11-12): `otherExpensesMargin` stays an integer 1..100** on create (as v1).
- **Owner (2026-11-12): amounts are trusted from the client as in v1**, but must be numbers >= 0; fruit `price` and `total` are required (cup `cost`, `sellingPrice`, `total` too). Server does not recompute totals.
- **Owner (2026-11-12): `fruits` required (at least one item) and `baseFruitIsFree` a required boolean** on create/update.
- **Settled by the general rules, no question needed (D):** contract stays: `DELETE` 200 `{ message }`, `POST` 201 with the order row, `GET /:id` raw row + `orderType`, list shape unchanged; every `fruits.*.fruitId` must be the user's non-deleted fruit (404 `Voće nije pronađeno`) and `orderTypeId` too; cup ids must be the user's non-deleted cups; deleted/missing order 404 `Serija nije pronađena`; invalid id 400 `Neispravan ID`; messages in Serbian.
- **Owner (2026-11-12): a transaction always decreases stock.** Server accepts `-3` and `3` as the same (decrease by 3), stores the value as negative (as v1, so old data stays compatible), rejects 0. UI unchanged.
- **Owner (2026-11-12): negative stock is rejected** with 400 `Nema dovoljno tegli na stanju` (like tomatoes v2), checked in a DB transaction; it applies to transaction create/update/restore, order update/delete/fruit change and negative corrections. Stock that is already negative may still recover.
- **Settled by the rules (no question):** `status` must be a value of the Prisma `TransactionStatus` enum (400 otherwise); unknown/foreign fruit or cup -> 404/400 as for orders; deleted/missing transaction 404 `Transakcija nije pronađena`; `DELETE /transactions/:id` is a plain soft delete (body `{ isDeleted: true }` is accepted and ignored); `POST /transactions` always returns the transaction row (201), not the inventory row; corrections endpoint keeps the route `POST /inventory/input` and request shape, returns 201 with the created correction; `GET /inventory` and `GET /inventory/overview` keep their response shapes, computed from orders - transactions + corrections.
- **Owner (2026-11-12): migration procedure (there is only one database, it must never be lost).** The migration is additive (one `CREATE TABLE`, no `DROP`/`ALTER` of existing data). Never run `prisma migrate dev` against the real database (it can ask for a reset); generate with `npx prisma migrate dev --create-only`, show the SQL to the owner, the owner makes a backup (Supabase backup or `pg_dump`), and only with explicit approval apply it with `npx prisma migrate deploy` (never resets). Render does not run migrations, so it is applied manually once. Code must not depend on the table before it is applied.
- **Owner (2026-11-12): all together.** `orders` + `transactions` + `inventory` v2 (including the corrections table) in one BE PR, then one UI switch for all three.
- **Owner (2026-11-12): keep the old infrastructure.** The `Inventory` counter table is not dropped or changed, and v1 code stays as is, so we can switch back to v1 if needed. v2 uses derived stock (A1) plus a new corrections table (E) for manual stock entries; v2 does not write `Inventory`.
- Consequence to handle: while v2 is used, the v1 counter is no longer updated and goes stale. Before any rollback to v1 the counter must be recomputed from orders, transactions and corrections (a small script or documented query; real user data only with the owner's explicit OK). Migrations are additive only (new table), never edit existing migrations.

## Decisions needed from the owner (one at a time)

**A. How does v2 stock work?** *Decided: A1 + E (see Decisions above).* Options were:
- **A1. Derived stock (like v2 tomatoes). Recommended; the owner already leans this way (counter not needed).** Stock = SUM(non-deleted order cups) - SUM(non-deleted transaction cups) per fruit and cup, computed from the data. `Inventory` is no longer written by v2. No counter, no drift. Needs orders, transactions and inventory v2 to go live together (same UI switch), and a check of v1 data: v1 stock may already differ from the derived value (items 3-5), so compare before switching. Real user data is never touched; compare read-only on test data or with the owner's explicit OK.
- **A2. Keep the `Inventory` counter, fix it.** v2 orders write the counter inside one `prisma.$transaction`, with atomic increments, correct diffs for removed cups and for a changed fruit, and a 400 `Nema dovoljno tegli na stanju` instead of clamping. Smaller change, but the counter can still drift from the orders.
- **A3. Normalise `Order.cups`/`Order.fruits` into tables** (needs a Prisma migration and a data migration of real data). Biggest and riskiest; only if A1 is not enough.

**B. Order of work.** Orders alone first (needs A2, or v2 orders that keep writing the counter while v1 transactions still read it), or `orders + transactions + inventory` as one block (A1).

**C. Validation rules** (only after A): minimum `numberOf` (>= 1), non-empty `cups`, duplicate cup ids, `otherExpensesMargin` 0 allowed, whether the server recomputes/validates `cost`, `sellingPrice`, `total` or keeps trusting the client (the UI sends them; contract stays either way), whether `fruits.*.price/total` become required.

**D. Existing contract points to confirm:** `DELETE` response `200 { message }` kept; `POST` 201 with the row; `GET /:id` shape (raw row vs list item shape).

**E. Manual stock corrections.** v1 `POST /inventory/input` adds a (possibly negative) quantity to the counter by hand. **Checked in the UI:** it is used. `InventoryPage` has the dialog `InventoryConfigForm` ("Konfiguracija inventara": initial stock and direct corrections; fruit, cup, `numberOf` that may be negative; the button is enabled only after a client-side password check). The UI also calls `GET /inventory` (grouped by fruit) and `GET /inventory/overview` (total per cup). With A1 the correction needs a replacement that keeps the same request shape, e.g. a small corrections table (`userId`, `orderTypeId`, `cupId`, `quantity`, `createdAt`, soft delete) counted into the stock sum; the counter table is then unused by v2. Needs a Prisma migration. Note: the client-side password in this form is not real protection (server does not check it); belongs to the auth/security work, not to this change.

## UI usage (checked in `UI_dzem_kalkulator`)

Orders (`api/ordersApi.ts`, `types/orders.ts`, `pages/Jams/OrdersPage`):
- `GET /orders?orderTypeId&priceStatus&year&month` -> reads `orders[]`, `totalValue`, `totalExpense`, `totalProfit`, `totalCups`. The UI type says `profitMargin: number`, the server sends `"N%"` (string). Keep as is.
- `GET /orders/:id` is used by the edit form: reads `orderName`, `orderTypeId`, `baseFruitIsFree`, `fruits`, `cups` from the raw row.
- `POST /orders` and `PUT /orders/:id` send `fruits[{grams, price, total, fruitId}]` (all strings), `cups[{id, label, numberOf, cost, sellingPrice, total}]`, `orderTypeId`, `orderName`, `baseFruitIsFree`, `otherExpensesMargin`. The PUT body also has `id`.
- **Edit overwrites `otherExpensesMargin` with the current constant** (`otherExpansesMargin?.value || 1`, `EditOrder.tsx`), so editing an old order silently changes its margin and profit. This is the reason for `|| 1` and the min-1 rule. To decide (see C).
- `DELETE /orders/:id` -> response body is not used.

Transactions (`api/transactionsApi.ts`, `pages/Jams/TransactionsPage`):
- `GET /transactions?orderTypeId&transactionStatus&year&month` (list item: `id`, `orderType` (label), `cups[{cupId, quantity (positive), label}]`, `status`, `createdAt`, `isDeleted`, `note`).
- `GET /transactions/:id` returns the raw row (`orderTypeId`, `cups` with the stored negative `quantity`, `status`, `note`); the edit form maps it with `Math.abs`.
- `POST` and `PUT` send `cupData[{cupId, quantity}]` with **negative** quantity (the UI negates it; the server trusts the sign, so a positive quantity from another client would *increase* stock), plus `orderTypeId`, `status`, `note`. `POST` returns the transaction row, except the first transaction of a fruit, which returns the created `Inventory` row (different shape; UI ignores the body).
- `DELETE /transactions/:id` sends body `{ isDeleted: true }` (v1 handler needs it).

Inventory: see E. Every transaction/order mutation invalidates the `Inventory` tag, so the stock screen refetches after them (stays valid with derived stock).

## Steps

1. Owner decides A, then B (one question each, one field, no comment field).
2. Check the UI repo for how orders, transactions and inventory are used (request/response fields actually read, who displays stock). Record in this file.
3. Fill the *Analysis* / *Decisions* sections for the five order endpoints in `v2-endpoints.md` (link here) and stage them `analysed` -> `decided`.
4. Implement `src/v2/...` (service with stock logic in one place, `parseId`, `updateMany` + `findUniqueOrThrow` for atomic update/delete, 404 for deleted rows, swagger tag `Orders v2`), plus tests in `tests/` with `userId = 1`.
5. Build and tests: `npm run build`, `npx vitest run`.
6. Put the `UI on v2` stage and docs into the **same** BE PR (note that the UI flag follows after deploy). Then the UI flag in `src/constants/apiVersions.ts`, audit, `npx tsc --noEmit`, e2e spec.

## Open questions

- All planning decisions for orders, transactions and inventory are recorded in Decisions. Next: per-endpoint analysis in `v2-endpoints.md` (stage `decided`), then implementation.
