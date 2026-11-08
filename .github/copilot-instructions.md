# Copilot instructions

Read [AGENTS.md](../AGENTS.md) first; it is the single source of truth for commands, layout and hard rules.
Then see `docs/architecture.md` and `docs/domain.md`, and use the `repo-conventions` skill (`.github/skills/repo-conventions/SKILL.md`) when adding or changing endpoints.

Key reminders: ESM imports with `.js` extension, controllers -> services -> Prisma, scope every query by `userId`, soft delete, `AppError` + `asyncHandler`, `dist/` is git-ignored (Render builds it; run `npm run build` locally, never hand-edit), no secrets in the repo.
