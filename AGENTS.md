# AGENTS.md

Backend for "Džemulator", a small bookkeeping app for a tiny jam/preserves business (single real user). The UI lives in a separate repo (`dzem-kalkulator`, deployed on Vercel). This is a test/hobby project that is being prepared for gradual refactoring.

## Stack

Node 22, TypeScript (strict, ESM), Express 5, Prisma 6 + PostgreSQL (Supabase), express-validator, winston, swagger-jsdoc/swagger-ui (`/api-docs`).

## Commands

| Task | Command |
|---|---|
| Dev (tsc watch + nodemon on `dist/`) | `npm run dev` |
| Build | `npm run build` |
| Start | `npm start` |
| Test | `npm test` (Vitest + supertest, tests in `tests/`) |
| New migration | `npx prisma migrate dev --name <NAME>` |

There is **no linter** yet. Tests run against the real database as test user `userId = 1` only (see `tests/helpers.ts`) and clean up after themselves. Validate changes with `npm run build` (zero errors) and `npm test`. `src/app.ts` builds the Express app (importable by tests); `src/index.ts` only calls `listen`.

## Layout

```
src/index.ts            app bootstrap, CORS allow-list, swagger, error handler
src/routes/index.ts     root router: mounts v1 at /api/<resource> and v2 at /api/v2/<resource>
src/v1/                 current (legacy) code, do not change behaviour
  routes/ controllers/ services/ validationSchemas/
src/v2/                 refactored code, same structure (routes/ controllers/ services/)
src/middlewares/        asyncHandler, errorHandler, handleValidationErrors, auth/
src/utils/              AppError, prisma client (db.ts), winston logger
src/types/              shared TS types, express.d.ts (req.user)
prisma/schema.prisma    data model; prisma/migrations/ is history
```

Details: [docs/architecture.md](docs/architecture.md), [docs/domain.md](docs/domain.md), [docs/known-issues.md](docs/known-issues.md), [docs/v2-migration.md](docs/v2-migration.md). Step-by-step conventions: skill `repo-conventions` in `.github/skills/repo-conventions/SKILL.md`.

## Hard rules

- **Never commit or push directly to `main`.** Check `git branch --show-current` before every commit; if it is `main`, switch to a feature branch first.
- **Every pull request targets `main`, always** (`gh pr create --base main`). Never target another feature branch, even if the work depends on an unmerged PR.
- **New branches are always created from an up-to-date `main`** (`git fetch origin`, then `git switch -c <name> origin/main`), never from another feature branch.
- **Never commit without the owner's explicit approval, and never push without explicit approval.** Show the changes first, then wait. Approval does not carry over between commits/pushes.
- **`dist/` is committed** and Render runs `node dist/index.js` on push to `main` (whether Render also builds is unverified). Never edit `dist/` by hand; run `npm run build` and commit the regenerated output together with the `src/` change.
- Never commit secrets. `.env` is git-ignored; `DATABASE_URL` and `JWT_SECRET` come from the environment. Do not paste connection strings or passwords into code, docs or commits.
- Imports use the `.js` extension (ESM), e.g. `import x from '../utils/db.js'`.
- Every query is scoped by `userId` (from the `x-user-id` header). Never return or modify another user's rows.
- Deletes are soft (`isDeleted: true`); list/get queries filter `isDeleted: false`.
- Errors: `throw new AppError(message, status.X)` inside `asyncHandler`; do not send error responses by hand in controllers.
- Schema changes require a Prisma migration; never edit existing migrations.
- Refactoring happens in a parallel v2 (`/api/v2/...`); do not change v1 behaviour. See [docs/v2-migration.md](docs/v2-migration.md). Real data belongs to `userId = 12397`; tests and manual experiments may use only test user `userId = 1`.
- Keep changes surgical. This codebase is going to be refactored incrementally, so do not do drive-by restructuring.
