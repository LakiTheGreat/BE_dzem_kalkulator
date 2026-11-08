# v1 / v2 migration plan

Goal: refactor the backend gradually without breaking the running app. v1 (current code) and v2 (refactored) run side by side; the UI picks which one each resource calls, so rollback is a flag flip in the UI.

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

## Open items

- Test runner choice (not decided; none is installed yet).
- How the UI flag is stored (UI repo concern).
- Whether Render builds `dist/` itself (see `known-issues.md`).
