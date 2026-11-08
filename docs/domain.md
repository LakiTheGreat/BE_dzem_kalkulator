# Domain

A hobby business makes fruit jams in different cup (jar) sizes and also sells tomato products and bouquets. The app calculates costs/prices and tracks stock and sales. Effectively one real user; `userId` is a namespace, not real multi-tenancy.

> Derived from code and the schema. Items marked *(unverified)* were inferred and should be confirmed by the owner.

## Jam module

| Concept | Model | Notes |
|---|---|---|
| Fruit | `Fruit` | Jam type (e.g. "Jasika"). Creating a duplicate label auto-suffixes `(2)`, `(3)`... |
| Cup | `Cup` | Jar type; references a `CupCost` (production cost) and a `CupValue` (selling price). |
| CupCost / CupValue | `CupCost`, `CupValue` | Lookup lists of integer cost / price values with labels. |
| ConfigConstant | `ConfigConstant` | Integer settings with label + description. |
| Order | `Order` | A production batch ("order") of one fruit: `fruits` (ingredients: grams, price, total), `cups` (how many of each cup, cost, selling price), `baseFruitIsFree`, `otherExpensesMargin` (default 25). Price/cost values are copied into JSON, so history does not change when lookups change *(unverified: assumed intentional)*. |
| Inventory | `Inventory` | One row per fruit; `cupData: [{cupId, quantity}]` = stock per cup. Managed via `/api/inventory` upsert (adds quantities). |
| Transaction | `Transaction` | Stock movement for a fruit with `status`: `CONSUMED, SOLD, GIVEN_AWAY, PROMOTION, OTHER`. Stored `cups` quantities are negative; the list endpoint returns absolute values. Creating a transaction also merges its quantities into `Inventory`. |

Flow: Order (what was produced) is tracked separately from Inventory (stock). Transactions decrease stock. Orders do **not** automatically touch inventory.

## Bouquet module

`BouquetTransaction`: simple record of a sale with `status` (`SOLD, GIVEN_AWAY, PROMOTION, OTHER`), `totalExpense`, `income`, `profit`, `profitMargin`.

## Tomato module

Separate, simpler copy of the same ideas: `TomatoCup` (jar type), `TomatoOrder` (production: `numOfCups`, `totalExpenses`), `TomatoOrderTransaction` (sale/movement: `status`, `numOfCups`, `pricePerCup`, `note`). Exposed under `/api/tomatoes` (`/`, `/cups`, `/totals`, `/transactions`).

## Glossary (UI/DB names are Serbian/English mixed)

- *orderType* in `Order`/`Transaction`/`Inventory` is a **Fruit**, not a type enum.
- *dzem* = jam, *čaša* = cup/jar, *paradajz* = tomato, *buket* = bouquet.
