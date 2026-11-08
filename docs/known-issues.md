# Known issues / refactoring candidates

Documented state as of AI setup; none are fixed yet. Do not fix them opportunistically inside unrelated changes.

## Security
- Login uses one hard-coded password in `auth.controller.ts`; auth is a mock keyed on a client-supplied `x-user-id` header (anyone knowing a userId can act as that user). `protectRoute`/`createJWT` are unused; `JWT_SECRET` falls back to `'no secret'`.
- `mockAuth` does not `return` after the 401 for a missing header (execution continues into the DB lookup and can attempt a second response).
- CORS allow-list is hard-coded in `index.ts`.
- `README.md` includes part of a database connection string; keep real credentials out of the repo.

## Structure
- `transaction.controller.ts` calls Prisma directly and has business logic in the controller; other controllers are cleaner.
- Tomato module duplicates the order/transaction pattern.
- Controller files are very large because of inline swagger JSDoc (`order.controller.ts` ~25 KB).
- Typing: widespread `any` (`whereClause: any`, `cupData: any`), `Json[]` columns cast with `as`.
- File typo `logRequets.ts`; `routes/tomatoes.routes.ts` is plural while the others are singular.
- Swagger metadata in `index.ts` has a mojibake title; swagger examples are partly stale (e.g. Fruit schema documents `value` while the model uses `label`).

## Data integrity
- Creating a transaction writes the transaction and then updates inventory in two separate Prisma calls (no `prisma.$transaction`), so they can diverge.
- Inventory stock can be driven negative; no explicit check.
- `Inventory` primary key is `orderTypeId` only, while it also carries `userId`.

## Tooling
- No linter/formatter config and no CI. Tests exist only for `fruits` (`tests/`).
- `dist/` is committed (124 files); unclear whether Render builds on its own.
- `package.json` has a real `test` script (`vitest run`).
