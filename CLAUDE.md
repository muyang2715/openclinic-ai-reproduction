# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`open-clinic-ai` is a Turborepo monorepo managed with **pnpm** (`pnpm@9`, Node `>=18`). It is being built out from the `create-turbo` starter — the `web` app and `@repo/*` packages are still largely scaffolding, while `apps/api` is the actively developed backend.

## Workspaces

Workspaces are globbed from `apps/*` and `packages/*` (see `pnpm-workspace.yaml`):

- **`apps/web`** — Next.js 16 / React 19 frontend (App Router, dev on port 3000). Consumes `@repo/ui`.
- **`apps/api`** — Express 5 + Prisma 7 backend. **Standalone**: it does *not* use the shared `@repo/eslint-config` / `@repo/typescript-config`, defines its own `tsconfig.json`, and has no `lint`/`check-types` scripts, so Turbo's `lint`/`check-types` tasks skip it.
- **`packages/ui`** (`@repo/ui`) — shared React components, exported per-file via `./src/*.tsx`.
- **`packages/eslint-config`** (`@repo/eslint-config`) — flat ESLint configs: `./base`, `./next-js`, `./react-internal`.
- **`packages/typescript-config`** (`@repo/typescript-config`) — shared `tsconfig` bases (`base.json`, `nextjs.json`, `react-library.json`).

> The `apps/docs` app from the starter has been removed (still shows as deleted in git status).

## Commands

Run from the repo root unless noted. Turbo respects task dependencies and caching.

```sh
pnpm install          # install all workspace deps
pnpm dev              # turbo run dev — all apps in watch/persistent mode
pnpm build            # turbo run build (^build ordering)
pnpm lint             # turbo run lint
pnpm check-types      # turbo run check-types
pnpm format           # prettier --write across **/*.{ts,tsx,md}
```

Scope a task to one workspace with a filter:

```sh
pnpm dev --filter=web
pnpm build --filter=@repo/ui
```

There is **no test runner configured** in any workspace yet.

### `apps/api` (run from `apps/api/`)

```sh
pnpm dev      # tsx watch src/index.ts
pnpm build    # tsc  -> ./dist
pnpm start    # node dist/index.js
```

The entry point is `src/index.ts`, which compiles to `dist/index.js` under `rootDir: ./src` — so `pnpm start` (`node dist/index.js`) is correct. The server bootstraps Express, serves Swagger UI at `/api-docs`, mounts versioned routes under `/api/v1`, and listens on `PORT` (set in `apps/api/.env`).

### `apps/api` structure & conventions

Backend follows `docs/coding-standards.md` §2 (flat Express, no service layer): `routes → controllers → helpers → data`, with the Prisma client queried only in `data/`.

- `src/config/config.ts` — loads env via `dotenv/config` and exports `PORT`. (Not yet zod-validated; tightening this into a fail-fast env module — and validating `DATABASE_URL`/`NODE_ENV` — is a pending task.)
- `src/config/swagger.ts` — the OpenAPI spec, maintained centrally (`definition.paths` + `components.schemas`; `apis: []` so route files carry no doc comments); served by `swagger-ui-express` at `GET /api-docs`. Add new endpoints' `paths`/`schemas` here.
- `src/libs/prisma.ts` — the Prisma client singleton. **Prisma 7's `prisma-client` generator uses the WASM query compiler, so it requires a driver adapter** — we use `@prisma/adapter-pg` (`PrismaPg`) wired to `DATABASE_URL`.
- `src/errors/AppError.ts` — `AppError(code: string, message, status)`, thrown for expected failures (local for now; no `ErrorCode` enum yet — migrate both to `@repo/shared` when the frontend lands).
- `src/helpers/apiResponse.ts` — `sendSuccess(res, status, message, data?)` → `{ success, message, data }`, and `sendError(res, error)` which maps `AppError`, `ZodError` (→400), Prisma `P2025` (→404) / `P2002` (→409), else 500, to `{ success, message }`. Response shape + error mapping live only here.
- `src/middleware/errorHandler.ts` — the final safety-net error sink; delegates to `sendError`.
- `src/schemas/` — zod request schemas (e.g. `doctor.schema.ts`: `createDoctorSchema`, `updateDoctorSchema`). Reuse the Prisma-generated `AppointmentStatus`/`DayOfWeek`/`ScheduleExceptionType` enums via `z.nativeEnum` when those land.
- `src/controllers/`, `src/data/`, `src/routes/` — per-resource. All four domain resources exist: `doctor`, `doctorSchedule` (`/schedules`), `appointment` (`/appointments` — `patientName`, `start`/`endTime`, `AppointmentStatus`, `reason?`; list filterable by `doctorId`), `scheduleException` (`/exceptions` — `date`, `OFF`/`CUSTOM` type, optional `HH:mm` times, unique per `[doctorId, date]` → 409 on duplicate).

Routers mount under `/api/v1/<resource>` (e.g. `/api/v1/doctors`, `/api/v1/schedules`) with action-style paths: `POST /createDoctor`, `GET /getDoctors`, `GET /getDoctorById/:id`, `PATCH /updateDoctor/:id`, `DELETE /deleteDoctor/:id` (and the analogous `*Schedule*` set). Each controller wraps its body in `try/catch`, returning `sendSuccess(...)` on success and `sendError(res, error)` on failure. Endpoints are documented centrally in `config/swagger.ts` (not via route comments) and surface at `/api-docs`.

`createDoctor` optionally accepts a `schedules[]` array and creates the doctor + weekly slots in one nested Prisma write (serves the single admin form), returning the doctor with `schedules` included. Individual slot edits go through the `schedules` resource, not `updateDoctor` (which does not touch schedules). The `schedules` list endpoint filters by a required `doctorId` query param.

## Database (Prisma, in `apps/api`)

- Config lives in `apps/api/prisma.config.ts` (not in `schema.prisma`): it points at `prisma/schema.prisma`, sets the datasource `url` from `env("DATABASE_URL")`, and defines migrations path + seed command (`tsx prisma/seed.ts`).
- Datasource is **PostgreSQL**; `DATABASE_URL` must be set in `apps/api/.env`.
- The Prisma client is generated to `apps/api/src/generated/prisma` (gitignored) using the new `prisma-client` generator — import the client from there, not from `@prisma/client`.
- Run Prisma commands from `apps/api/` (e.g. `pnpm exec prisma migrate dev`, `pnpm exec prisma generate`, `pnpm exec prisma db seed`). The schema defines `Doctor`, `DoctorSchedule`, `Appointment`, and `ScheduleException` (plus the `AppointmentStatus`/`DayOfWeek`/`ScheduleExceptionType` enums); an initial migration exists under `prisma/migrations/`. `prisma/seed.ts` does not exist yet.

## Conventions

- `apps/api` TypeScript is strict with extra safety flags on (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) and compiles to CommonJS; account for these when writing API code.
- `apps/web` type-checks via `next typegen && tsc --noEmit` and lints with `--max-warnings 0` (zero-warning policy).
- ESLint configs use `eslint-plugin-only-warn`, so violations surface as warnings — but the zero-max-warnings lint scripts still fail CI on them.
