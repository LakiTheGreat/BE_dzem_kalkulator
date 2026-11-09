# v1 / v2 migration plan

Goal: refactor the backend gradually without breaking the running app. v1 (current code) and v2 (refactored) run side by side; the UI picks which one each resource calls, so rollback is a flag flip in the UI.

Why: make the code better, faster and more modern, and above all safe to change, so features can be changed or added without everything breaking (v1 is tightly entangled). How to migrate an endpoint: skill `api-v2-migration`.

## Decisions

| Topic | Decision |
|---|---|
| Version selection | URL: `/api/v2/<resource>` next to existing `/api/<resource>` (v1). The UI has a per-resource flag choosing v1 or v2. |
| Database | Same database. v2 may only make **additive** schema changes (new columns/tables). v1 must keep working unchanged on the same data, otherwise rollback is not possible. |
| Safety net | Characterization tests: record v1 behaviour for a resource first, then run the same tests against v2. A resource is migrated only when both pass. |
| Pilot resource | `fruits` (smallest, cleanest). Harder ones (`transactions` + `inventory`) come after the mechanism is proven. |
| Test data | Tests run against the existing database but **only as test user `userId = 1`**. Never run against user `12397` (real data). |

## Rules

- **Never modify v1 code or behaviour** while building v2. v1 is the fallback. Bug fixes in v1 only when explicitly requested.
- v2 lives in its own folders (e.g. `src/v2/routes|controllers|services`) and is mounted at `/api/v2` in `src/routes/index.ts`. Shared code (`utils/`, `middlewares/`, Prisma client) may be reused but not changed in a behaviour-affecting way.
- Remove a v1 resource only after its v2 has run in production for a while and the owner agrees.
- Tests must refuse to run unless the configured test user id is `1` (guard against touching real data), and must clean up everything they create (hard delete by `userId = 1`).
- Migrations for v2 must be additive; never drop/rename columns v1 reads.

## Steps (per resource)

1. Write characterization tests against v1 (as user 1).
2. Build v2 under `/api/v2/<resource>` and make the same tests pass.
3. Add the UI flag for that resource (separate UI repo), default to v1.
4. Flip the flag; watch; flip back if anything is wrong.
5. After a stable period, retire v1 for that resource.

## Testing

Vitest + supertest (`npm test`). Suites in `tests/` are parametrized by API base path (`describe.each(['/api', '/api/v2'])`) for behaviour that must be identical in v1 and v2; v2-only fixes get their own `describe`.

## UI flag

Decided in the UI repo: per-endpoint constant in code (`src/constants/apiVersions.ts`), default v1, rollback = flip the constant and redeploy.

## Deploy

Render builds the app itself on every deploy (`npm install && npx prisma generate && npm run build`, then `node dist/index.js`; verified in the deploy log), so `dist/` is not committed.

## Open items

None right now. New ones are recorded in `v2-endpoints.md` per endpoint, or in `known-issues.md` for general problems.

## Status and decisions

Per-endpoint status, analysis, decisions and open questions live in [v2-endpoints.md](v2-endpoints.md). Update it before (analysis), during (decisions) and after (status) every endpoint.

## Cross-cutting decisions

### Auth (v2 `mockAuth`)
- Same responses as v1 (401 no header, 404 unknown user); stops after the 401 (v1 sent a second response and logged "Cannot set headers after they are sent").

### Error messages (standard for all v2 endpoints)
- Every `AppError` message a user can see (not found, stock, business rules, invalid id) is written in **Serbian** and is short and user-readable.
- Validation messages from express-validator (JSON array of field errors) stay in English; they are for developers, not shown to the user.
- The UI shows the server `message` for 4xx errors and falls back to its generic "Nešto ne valja" when there is none (`useApiErrorNotification`).
- Introduced with tomatoes v2 and applied to fruits. By the owner's decision the Fruits **v1** messages (errors and the delete success message) were translated too, so v1 and v2 return identical text and shared tests have no per-version branches. This is the one exception to "do not change v1 behaviour" (text only, no status/shape change).

## Not decided / known limitations

- Two simultaneous `POST`s with the same label can still produce duplicates (no unique constraint on `Fruit(userId, label)`; adding one is a schema change and v1 may already have duplicates). Negligible for a single user; decide before scaling.
- UI error handling for the new 404s (v1 gave 400 for missing fruit) was not checked; the UI shows a generic error notification.
- Removing the v1 endpoints: not before v2 has run in production for a while.
- Tomatoes v2: stock is not stored, only derived (SUM orders - SUM transactions); concurrent writes can still race past the stock check. Jam inventory (`Inventory` JSON counter, see v1) should move to the same derived model later; not part of this change.

## Process (see skill `api-v2-migration`)

Analysis first -> record it in `v2-endpoints.md` -> ask the owner about anything disputed, one question at a time -> record decisions -> implement -> tests for v1+v2 and for every fix -> update status. Branches start from `main`, PRs target `main`, no commit/push without approval.
