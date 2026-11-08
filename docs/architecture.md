# Architecture

## Request flow

```
request -> CORS -> express.json -> logRequests -> /api router
        -> mockAuth (all routers except /auth)
        -> checkSchema(schema) -> handleValidationErrors   (only on write routes)
        -> controller (asyncHandler) -> service -> prisma
        -> errorHandler (AppError | Prisma known error | Error)
```

- `src/index.ts` — CORS allow-list is hard-coded (local, Render, Vercel UI). Add new origins there.
- `src/routes/index.ts` — root router; mounts v1 routers (`src/v1/routes/`) at `/api/<resource>` and v2 at `/api/v2/<resource>`; every router except `/auth` is behind `mockAuth`. Paths below `src/` in this document refer to `src/v1/` for the legacy layers (controllers, services, routes, validationSchemas).
- Resources: `auth, fruits, cups, cupCosts, cupValues, constants, orders, inventory, transactions, bouquets, tomatoes`.

## Layers (intended)

| Layer | Responsibility |
|---|---|
| route | URL, HTTP verb, validation schema, controller binding |
| validationSchema | express-validator `Schema` for body/params |
| controller | read `x-user-id`, call services, shape response, throw `AppError`; holds the swagger JSDoc |
| service | Prisma access (`import prisma from '../utils/db.js'`) |

Reality check: `transaction.controller.ts` still calls `prisma` directly in places; `tomato.service.ts` and `transaction.service.ts` contain business logic. See [known-issues.md](known-issues.md).

## Auth

`mockAuth` reads the `x-user-id` header, loads the `User`, sets `req.user`; 401/404 otherwise. Controllers re-read `Number(req.header('x-user-id'))`. `POST /api/auth/login` checks a single hard-coded password and returns a `userId`. `protectRoute`/`createJWT` exist but are unused.

## Error contract

Responses: `{ message, status, customStatusCode }`. `P2025` (Prisma record not found) is mapped to 400 with `customStatusCode: 'PRISMA_P2025'`. Validation failures become `AppError(400)` whose message is the JSON-stringified express-validator error array.

## Logging

winston -> console + `logs/app.log` + `logs/error.log` (`logs/` is git-ignored). `logRequests` logs every request.

## Data access

Prisma, PostgreSQL. Every model has `userId` (default 1, cascade delete) and most have `isDeleted` and `createdAt`. Several models store snapshots/arrays in `Json[]` columns (`Order.cups`, `Order.fruits`, `Transaction.cups`, `Inventory.cupData`).

## Build & deploy

`tsc` compiles `src/` to `dist/` (git-ignored). Push to `main` triggers a Render deploy; Render runs `npm install && npx prisma generate && npm run build` itself, then `node dist/index.js`. Local dev: `npm run dev`. Swagger is generated from JSDoc in `src/v1/controllers/*.ts` and `src/v2/controllers/*.ts`.

## Conventions observed in code

- File naming: `<resource>.controller.ts`, `<resource>.service.ts`, `<resource>.routes.ts`, `<resource>Schema.ts`.
- Service functions are named `<verb><Thing>Service`; controllers are `asyncHandler(async (req, res) => ...)`.
- Status codes via `http-status` (`status.OK`, `status.NOT_FOUND`, ...).
- Swagger JSDoc block sits directly above each controller.
