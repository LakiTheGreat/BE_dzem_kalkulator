# v2 endpoint tracker

One place for every endpoint: where it stands, what was analysed, what was decided, what is still open. Plan and rules: [v2-migration.md](v2-migration.md). How to migrate: skill `api-v2-migration`.

**Rule: analysis comes first.** Before any implementation, fill in *Analysis* for the endpoint (v1 code, bugs, improvements, disputed points). Disputed points go to the owner one question at a time; record the answer under *Decisions*. Only then implement.

Stages: `not started` -> `analysed` -> `decided` -> `implemented` -> `UI on v2`.
Contract (routes, status codes, response shape) stays the same and the UI is not changed unless explicitly agreed.

## Overview

All paths are relative to `/api` (v1) and `/api/v2` (v2).

| Resource | Endpoint | Stage | Notes |
|---|---|---|---|
| auth | `POST /auth/login` | not started | |
| fruits | `GET /fruits` | UI on v2 | |
| fruits | `POST /fruits` | implemented (PR #6) | UI flag `v2` merges after BE deploy |
| fruits | `PATCH /fruits/:id` | implemented (PR #6) | same |
| fruits | `DELETE /fruits/:id` | implemented (PR #6) | same |
| cups | `GET /cups` | not started | |
| cups | `POST /cups` | not started | |
| cups | `PUT /cups/:id` | not started | |
| cups | `DELETE /cups/:id` | not started | |
| cupCosts | `GET /cupCosts` | not started | |
| cupCosts | `POST /cupCosts` | not started | |
| cupCosts | `PUT /cupCosts/:id` | not started | |
| cupCosts | `DELETE /cupCosts/:id` | not started | |
| cupValues | `GET /cupValues` | not started | |
| cupValues | `POST /cupValues` | not started | |
| cupValues | `PUT /cupValues/:id` | not started | |
| cupValues | `DELETE /cupValues/:id` | not started | |
| constants | `GET /constants/:id` | not started | no list route; UI uses hard-coded ids |
| constants | `PATCH /constants/:id` | not started | |
| orders | `GET /orders` | not started | |
| orders | `GET /orders/:id` | not started | |
| orders | `POST /orders` | not started | |
| orders | `PUT /orders/:id` | not started | |
| orders | `DELETE /orders/:id` | not started | |
| inventory | `GET /inventory` | not started | |
| inventory | `GET /inventory/overview` | not started | |
| inventory | `POST /inventory/input` | not started | |
| transactions | `GET /transactions` | not started | |
| transactions | `GET /transactions/:id` | not started | |
| transactions | `POST /transactions` | not started | |
| transactions | `PUT /transactions/:id` | not started | |
| transactions | `DELETE /transactions/:id` | not started | route is wired to a handler named `updateTransaction` (v1 `transaction.routes.ts`); verify in analysis |
| bouquets | `GET /bouquets` | not started | |
| bouquets | `GET /bouquets/:id` | not started | |
| bouquets | `POST /bouquets` | not started | |
| bouquets | `PUT /bouquets/:id` | not started | |
| tomatoes | `GET /tomatoes/cups` | not started | |
| tomatoes | `GET /tomatoes/totals` | not started | |
| tomatoes | `GET /tomatoes/transactions` | not started | |
| tomatoes | `GET /tomatoes/transactions/:id` | not started | |
| tomatoes | `POST /tomatoes/transactions` | not started | |
| tomatoes | `PUT /tomatoes/transactions/:id` | not started | |
| tomatoes | `DELETE /tomatoes/transactions/:id` | not started | |
| tomatoes | `GET /tomatoes` | not started | |
| tomatoes | `GET /tomatoes/:id` | not started | |
| tomatoes | `POST /tomatoes` | not started | |
| tomatoes | `PUT /tomatoes/:id` | not started | |
| tomatoes | `DELETE /tomatoes/:id` | not started | |

## Cross-cutting

### Auth middleware (v2 `mockAuth`)
- **Decisions:** same responses as v1 (401 without header, 404 unknown user); stops after the 401 (v1 sent a second response and logged "Cannot set headers after they are sent").

## auth

### POST /auth/login
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## fruits

### GET /fruits
- **Analysis:** v1 had a dead `!fruits` check and read the user from the raw header.
- **Decisions:** same contract as v1 (array of non-deleted fruits of the user, sorted by label); user from `req.user.id`; dead code removed.
- **Open questions:** none.

### POST /fruits
- **Analysis:** v1 validates before trimming, messages mention `value`, duplicate suffix is count-based, counts deleted fruits, uses an unescaped regex built from user input, has unreachable `if (!fruit) throw 500`.
- **Decisions:**
  - Trim first, then validate (`"  ab "` -> 400, whitespace-only -> 400).
  - Validation messages mention `label`.
  - Duplicate suffix = highest used suffix + 1 (plain label counts as 1), deleted fruits ignored, regex escaped; never collides.
  - Response unchanged: 201 + fruit.
- **Open questions:** concurrent POSTs with the same label can still duplicate (no unique constraint); see v2-migration.md.

### PATCH /fruits/:id
- **Analysis:** same suffix bugs as POST; renaming to the fruit's own name could collide with `"A (2)"`; works on deleted fruits; missing fruit gives 400 `PRISMA_P2025` by accident; id check lets `0`, `-1`, `1.5` through.
- **Decisions:**
  - Same label rules as POST; the fruit itself is excluded when looking for a free label.
  - Deleted or missing fruit -> 404 `Fruit not found`.
  - Id must be an integer >= 1, otherwise 400 `Invalid fruit ID`.
  - Response unchanged: 200 + fruit.
- **Open questions:** none.

### DELETE /fruits/:id
- **Analysis:** soft delete; deleting an already deleted fruit returned 200 again; missing fruit gave 400 `PRISMA_P2025`.
- **Decisions:**
  - Deleted or missing fruit -> 404.
  - Same id validation as PATCH.
  - One atomic `updateMany`; response unchanged: 200 `{ message: 'Fruit marked as soft-deleted', fruit }`.
- **Open questions:** none.

## cups

### GET /cups
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /cups
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /cups/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /cups/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## cupCosts

### GET /cupCosts
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /cupCosts
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /cupCosts/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /cupCosts/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## cupValues

### GET /cupValues
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /cupValues
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /cupValues/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /cupValues/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## constants

### GET /constants/:id
- **Analysis:** not done (note: there is no list route, the UI reads constants by hard-coded ids)
- **Decisions:** -
- **Open questions:** -

### PATCH /constants/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## orders

### GET /orders
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /orders/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /orders
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /orders/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /orders/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## inventory

### GET /inventory
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /inventory/overview
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /inventory/input
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

## transactions

### GET /transactions
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /transactions
- **Analysis:** not done (known: transaction + inventory update are not atomic, see known-issues.md)
- **Decisions:** -
- **Open questions:** -

### PUT /transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /transactions/:id
- **Analysis:** not done (the route uses a handler named `updateTransaction`; verify what it really does)
- **Decisions:** -
- **Open questions:** -

## bouquets

### GET /bouquets
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /bouquets/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /bouquets
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /bouquets/:id
- **Analysis:** not done (a DELETE route exists only as a commented-out line)
- **Decisions:** -
- **Open questions:** -

## tomatoes

### GET /tomatoes/cups
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/totals
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/transactions
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /tomatoes/transactions
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /tomatoes/transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /tomatoes/transactions/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### GET /tomatoes/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### POST /tomatoes
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### PUT /tomatoes/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -

### DELETE /tomatoes/:id
- **Analysis:** not done
- **Decisions:** -
- **Open questions:** -
