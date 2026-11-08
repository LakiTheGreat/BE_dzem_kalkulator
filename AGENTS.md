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
| Prisma client | `npx prisma generate` |
| New migration | `npx prisma migrate dev --name <NAME>` |

There are **no tests and no linter** yet. Validate changes with `npm run build` (must pass with zero errors).

## Layout

```
src/index.ts            app bootstrap, CORS allow-list, swagger, error handler
src/routes/             one router per resource, mounted in routes/index.ts
src/controllers/        request handling + swagger JSDoc
src/services/           Prisma queries
src/validationSchemas/  express-validator `Schema` objects
src/middlewares/        asyncHandler, errorHandler, handleValidationErrors, auth/
src/utils/              AppError, prisma client (db.ts), winston logger
src/types/              shared TS types, express.d.ts (req.user)
prisma/schema.prisma    data model; prisma/migrations/ is history
```

Details: [docs/architecture.md](docs/architecture.md), [docs/domain.md](docs/domain.md), [docs/known-issues.md](docs/known-issues.md). Step-by-step conventions: skill `repo-conventions` in `.github/skills/repo-conventions/SKILL.md`.

## Hard rules

- **`dist/` is committed** and Render runs `node dist/index.js` on push to `main` (whether Render also builds is unverified). Never edit `dist/` by hand; run `npm run build` and commit the regenerated output together with the `src/` change.
- Never commit secrets. `.env` is git-ignored; `DATABASE_URL` and `JWT_SECRET` come from the environment. Do not paste connection strings or passwords into code, docs or commits.
- Imports use the `.js` extension (ESM), e.g. `import x from '../utils/db.js'`.
- Every query is scoped by `userId` (from the `x-user-id` header). Never return or modify another user's rows.
- Deletes are soft (`isDeleted: true`); list/get queries filter `isDeleted: false`.
- Errors: `throw new AppError(message, status.X)` inside `asyncHandler`; do not send error responses by hand in controllers.
- Schema changes require a Prisma migration; never edit existing migrations.
- Keep changes surgical. This codebase is going to be refactored incrementally, so do not do drive-by restructuring.
