---
name: repo-conventions
description: Conventions for changing this Express + Prisma backend. Use when adding or modifying an endpoint, route, validation schema, controller, service or Prisma model in this repository.
---

# Repo conventions

Read `AGENTS.md` and `docs/architecture.md` first. Follow existing code in the nearest resource (e.g. `fruit.*` is the cleanest reference).

## Adding or changing an endpoint

1. **Model** (if needed): edit `prisma/schema.prisma`, add `userId` relation (`onDelete: Cascade`), `isDeleted Boolean @default(false)` and `createdAt` when the data is user-owned. Run `npx prisma migrate dev --name <NAME>` and commit the generated migration. Never edit old migrations.
2. **Service** `src/services/<resource>.service.ts`: Prisma queries only, named `<verb><Thing>Service`, always take `userId` and filter `userId` + `isDeleted: false`. Deletes are soft updates.
3. **Validation** `src/validationSchemas/<resource>Schema.ts`: export an express-validator `Schema`.
4. **Controller** `src/controllers/<resource>.controller.ts`: `export const x = asyncHandler(async (req, res) => {...})`. Read `Number(req.header('x-user-id'))`, call services, `throw new AppError(msg, status.X)` for errors, respond with `res.status(status.X).json(...)`. Put a `@swagger` JSDoc block above it (swagger only scans `src/controllers/*.ts`).
5. **Route** `src/routes/<resource>.routes.ts`: `router.post('/', checkSchema(schema), handleValidationErrors, controller)`; register new routers in `src/routes/index.ts` behind `mockAuth`.
6. **Build**: `npm run build` must succeed. `dist/` is committed; include the regenerated output, never hand-edit it.

## Rules

- ESM: relative imports end with `.js`.
- Use `http-status` constants, not numeric literals.
- Never touch another user's data: every query includes `userId`.
- Business logic goes into services, not new Prisma calls in controllers.
- Do not log or commit secrets, connection strings or passwords.
- Keep diffs focused; list unrelated problems in `docs/known-issues.md` rather than fixing them in passing.
- Update `docs/domain.md` when the data model or business behavior changes.
