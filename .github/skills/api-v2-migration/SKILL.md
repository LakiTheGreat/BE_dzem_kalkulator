---
name: api-v2-migration
description: How to migrate one v1 endpoint to /api/v2 in this repository. Use when implementing, reviewing or planning any v2 endpoint (controller, service, route, validation, tests).
---

# Migrating an endpoint to v2

Read `docs/v2-migration.md` first. Work **one endpoint at a time**, one question at a time.

## Goals of the migration

The point is not a copy of v1 under a new URL. v2 should make the code:
- **Safer to change**: features can be changed or added without fear of breaking everything (today everything is tightly entangled). Small single-purpose modules, clear boundaries (controller -> service -> db), no hidden coupling between resources, behaviour pinned by tests.
- **Better**: fix bugs, remove dead and duplicated code, simplify, optimize queries (no needless round trips, N+1, over-fetching).
- **Modern**: prefer current idioms and well-supported libraries/features over legacy patterns, where they are a clear improvement and fit the stack. A new dependency or pattern is a disputed change: ask first.
- **Stable and secure**: validated input, no trust in raw headers inside business code, consistent error handling, safe handling of user-supplied strings, every query scoped to the user.

Every v2 endpoint should be judged against these goals, within the constraint of keeping the existing contract (step 3).

## Procedure

0. **Analysis comes first.** Before writing any code, record the analysis of the endpoint in `docs/v2-endpoints.md` (its *Analysis* section), then the owner's answers under *Decisions* and anything unresolved under *Open questions*. Update the Stage in the overview table at every step.
1. **Read the v1 code in full** (controller, service, route, validation schema, swagger block) and the existing tests. Do not copy it blindly.
2. **Audit before writing.** List what is wrong or could be better in v1: bugs, edge cases (regex injection, races, deleted rows, wrong status codes), dead code, misleading validation messages, stale swagger, trusting `req.header` instead of `req.user`, duplicated logic, missing validation, N+1 queries.
3. **Do not carry over old bugs or bad solutions.** v2 is the place to fix them; "v1 did it this way" is not a reason.
   **But keep the existing contract** (routes, status codes, response shape, field names). We do not want to change the UI unless there is a real need and the owner explicitly agreed to it. A fix that would force a UI change is a disputed change (step 4).
   **Error messages are a standard, not a disputed change:** every user-visible `AppError` message in v2 is in Serbian (validation field errors stay English); the UI displays the server message and keeps its generic fallback. See "Error messages" in `docs/v2-migration.md`.
4. **Anything disputed is the owner's decision, not yours.** A change is disputed when it alters the observable contract (status codes, response shape, field names, validation rules, messages), the data model, or business behaviour. For each such point: stop, ask the owner **one question at a time** with a short recommendation and the v1 behaviour for comparison. Do not change it first and report later. Pure internal fixes with identical observable behaviour (e.g. escaping a regex) need no question, but must be listed in the summary.
5. **Implement** in `src/v2/{controllers,services,routes,validationSchemas}`: thin controller, logic in the service, `req.user.id` for the user, own validation schema, swagger block tagged `<Resource> v2`. Never import from `src/v1`.
6. **Test**: extend the characterization tests with `/api/v2` (`describe.each`) plus a test for every fixed bug. Real DB, test user `userId = 1` only. Run `npm run build` and `npm test`.
7. **Record** the result in `docs/v2-endpoints.md` (Decisions, Stage) and deviations from v1 or deferred ideas in `docs/v2-migration.md`. Flip the UI flag only in a separate, approved change.
8. **Update all docs BEFORE opening the PR**, so code, tests and documentation land in one PR (no follow-up docs PR): `docs/v2-endpoints.md` (overview Stage with the PR number, Decisions), `docs/v2-migration.md`, and any other doc the change touches (`docs/domain.md`, `docs/known-issues.md`, `docs/architecture.md`, `AGENTS.md`). Check with `Select-String`/grep for stale mentions of the migrated resource. Only then commit, push and open the PR.

Git rules from `AGENTS.md` apply (branch from `main`, PR to `main`, no commit/push without approval).
