# Known issues / refactoring candidates

Documented state as of AI setup; none are fixed yet. Do not fix them opportunistically inside unrelated changes.

## Security
- Login uses one hard-coded password in `auth.controller.ts`; auth is a mock keyed on a client-supplied `x-user-id` header (anyone knowing a userId can act as that user). `protectRoute`/`createJWT` are unused; `JWT_SECRET` falls back to `'no secret'`.
- `mockAuth` does not `return` after the 401 for a missing header (execution continues into the DB lookup and can attempt a second response).
- v1 `PUT /cups/:id` updates without a `userId` filter and re-assigns the cup to the caller (cross-user write); fixed in v2 (`/api/v2/cups`). Likely similar in v1 `cupCosts`/`cupValues` PUT; check when those are migrated.
- v1 `PATCH /constants/:id` accepts floats/strings for an `Int` column (500), returns and updates soft-deleted constants and allows `isDeleted` in the body; fixed in v2 (`/api/v2/constants`).
- CORS allow-list is hard-coded in `index.ts`.
- `README.md` includes part of a database connection string; keep real credentials out of the repo.

## Structure
- `transaction.controller.ts` calls Prisma directly and has business logic in the controller; other controllers are cleaner.
- Tomato module duplicates the order/transaction pattern (v1; v2 tomatoes is refactored with a shared stock service).
- Controller files are very large because of inline swagger JSDoc (`order.controller.ts` ~25 KB).
- Typing: widespread `any` (`whereClause: any`, `cupData: any`), `Json[]` columns cast with `as`.
- File typo `logRequets.ts`; `routes/tomatoes.routes.ts` is plural while the others are singular.
- Swagger metadata in `index.ts` has a mojibake title; swagger examples are partly stale (e.g. Fruit schema documents `value` while the model uses `label`).

## Data integrity
- Creating a transaction writes the transaction and then updates inventory in two separate Prisma calls (no `prisma.$transaction`), so they can diverge.
- Inventory stock can be driven negative; no explicit check in v1 (v2 tomatoes, orders, transactions and inventory block this).
- Express 5: `toInt()` does not change `req.query`; convert numeric query params in the controller (`queryInt` in `jam.controller.ts`).
- v1 inventory counter and v2 derived stock are independent. Before switching back to v1, recompute `Inventory` from orders - transactions + `InventoryCorrection` (see [v2-orders-plan.md](v2-orders-plan.md)).
- `Inventory` primary key is `orderTypeId` only, while it also carries `userId`.

## Tooling
- No linter/formatter config and no CI. Tests exist only for `fruits`, `cups` and `tomatoes` (`tests/`).
- `dist/` was committed (124 files) although Render builds it itself; it is now git-ignored and removed from the repo.
- `package.json` has a real `test` script (`vitest run`).
