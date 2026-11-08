---
name: repo-conventions
description: Conventions for changing this Express + Prisma backend. Use when adding or modifying an endpoint, route, validation schema, controller, service or Prisma model in this repository.
---

# Repo conventions

Read `AGENTS.md` and `docs/architecture.md` first. Follow existing code in the nearest resource (e.g. `fruit.*` is the cleanest reference).

## Adding or changing an endpoint

1. **Model** (if needed): edit `prisma/schema.prisma`, add `userId` relation (`onDelete: Cascade`), `isDeleted Boolean @default(false)` and `createdAt` when the data is user-owned. Run `npx prisma migrate dev --name <NAME>` and commit the generated migration. Never edit old migrations.
2. **Service** `src/<v>/services/<resource>.service.ts` (`<v>` = `v2` for new work; `v1` is legacy and frozen): Prisma queries only, named `<verb><Thing>Service`, always take `userId` and filter `userId` + `isDeleted: false`. Deletes are soft updates.
3. **Validation** `src/<v>/validationSchemas/<resource>Schema.ts`: export an express-validator `Schema`.
4. **Controller** `src/<v>/controllers/<resource>.controller.ts`: `export const x = asyncHandler(async (req, res) => {...})`. Read `Number(req.header('x-user-id'))`, call services, `throw new AppError(msg, status.X)` for errors, respond with `res.status(status.X).json(...)`. Put a `@swagger` JSDoc block above it (swagger scans `src/v1/controllers/*.ts` and `src/v2/controllers/*.ts`).
5. **Route** `src/<v>/routes/<resource>.routes.ts`: `router.post('/', checkSchema(schema), handleValidationErrors, controller)`; register new routers in `src/routes/index.ts` behind `mockAuth` (v2 under `/v2/<resource>`).
6. **Build**: `npm run build` must succeed. `dist/` is committed; include the regenerated output, never hand-edit it.

## Rules

- **Never commit or push directly to `main`.** Before every commit run `git branch --show-current`; if it is `main`, create/switch to a feature branch first.
- **Never commit without the owner's explicit approval, and never push without explicit approval.** Make changes, show what changed (summary/diff), then wait. Approval for one commit or push does not carry over to the next one.
- ESM: relative imports end with `.js`.
- Use `http-status` constants, not numeric literals.
- Never touch another user's data: every query includes `userId`.
- Business logic goes into services, not new Prisma calls in controllers.
- Do not log or commit secrets, connection strings or passwords.
- Keep diffs focused; list unrelated problems in `docs/known-issues.md` rather than fixing them in passing.
- Update `docs/domain.md` when the data model or business behavior changes.
