# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`open-clinic-ai` is a Turborepo monorepo managed with **pnpm** (`pnpm@9`, Node `>=18`). It is being built out from the `create-turbo` starter — the `web` app and `@repo/*` packages are still largely scaffolding, while `apps/api` is the actively developed backend.

## Workspaces

Workspaces are globbed from `apps/*` and `packages/*` (see `pnpm-workspace.yaml`):

- **`apps/web`** — Next.js 16 / React 19 frontend (App Router, dev on port 3000).
- **`apps/api`** — Express 5 + Prisma 7 backend. **Standalone**: it does _not_ use the shared `@repo/eslint-config` / `@repo/typescript-config`, defines its own `tsconfig.json`, and has no `lint`/`check-types` scripts, so Turbo's `lint`/`check-types` tasks skip it.
- **`packages/shared`** (`@repo/shared`) — shared TypeScript contracts (the Socket.io event contract in `src/socket.ts`), consumed by both apps; build it with `pnpm -F @repo/shared build` after changes.
- **`packages/eslint-config`** (`@repo/eslint-config`) — flat ESLint configs: `./base`, `./next-js`.
- **`packages/typescript-config`** (`@repo/typescript-config`) — shared `tsconfig` bases (`base.json`, `nextjs.json`).

> The starter's `apps/docs` app and `packages/ui` (`@repo/ui`) stub component library have been removed — `apps/web` uses its own `src/components/ui` (shadcn-style) instead.

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
pnpm build --filter=@repo/shared
```

There is **no test runner configured** in any workspace yet.

### `apps/api` (run from `apps/api/`)

```sh
pnpm dev      # tsx watch src/index.ts
pnpm build    # tsc  -> ./dist
pnpm start    # node dist/index.js
```

The entry point is `src/index.ts`, which compiles to `dist/index.js` under `rootDir: ./src` — so `pnpm start` (`node dist/index.js`) is correct. The server bootstraps Express, enables CORS for `WEB_ORIGIN` (default `http://localhost:3000`), serves Swagger UI at `/api-docs`, mounts versioned routes under `/api/v1`, and listens on `PORT` (set in `apps/api/.env`).

### `apps/api` structure & conventions

Backend follows `docs/coding-standards.md` §2 (flat Express, no service layer): `routes → controllers → helpers → data`, with the Prisma client queried only in `data/`.

- `src/config/config.ts` — loads env via `dotenv/config` and exports `PORT`. (Not yet zod-validated; tightening this into a fail-fast env module — and validating `DATABASE_URL`/`NODE_ENV` — is a pending task.)
- `src/config/swagger.ts` — the OpenAPI spec, maintained centrally (`definition.paths` + `components.schemas`; `apis: []` so route files carry no doc comments); served by `swagger-ui-express` at `GET /api-docs`. Add new endpoints' `paths`/`schemas` here.
- `src/libs/prisma.ts` — the Prisma client singleton. **Prisma 7's `prisma-client` generator uses the WASM query compiler, so it requires a driver adapter** — we use `@prisma/adapter-pg` (`PrismaPg`) wired to `DATABASE_URL`.
- `src/errors/AppError.ts` — `AppError(code: string, message, status)`, thrown for expected failures (local for now; no `ErrorCode` enum yet — migrate both to `@repo/shared` when the frontend lands).
- `src/helpers/apiResponse.ts` — `sendSuccess(res, status, message, data?)` → `{ success, message, data }`, and `sendError(res, error)` which maps `AppError`, `ZodError` (→400), Prisma `P2025` (→404) / `P2002` (→409), else 500, to `{ success, message }`. Response shape + error mapping live only here.
- `src/middleware/errorHandler.ts` — the final safety-net error sink; delegates to `sendError`.
- `src/schemas/` — zod request schemas (e.g. `doctor.schema.ts`: `createDoctorSchema`, `updateDoctorSchema`). Reuse the Prisma-generated `AppointmentStatus`/`DayOfWeek`/`ScheduleExceptionType` enums via `z.nativeEnum` when those land.
- `src/controllers/`, `src/data/`, `src/routes/` — per-resource. All four domain resources exist: `doctor`, `doctorSchedule` (`/schedules`), `appointment` (`/appointments` — `patientName`, `patientEmail?`, `start`/`endTime`, `AppointmentStatus`, `reason?`; list filterable by `doctorId`), `scheduleException` (`/exceptions` — `date`, `OFF`/`CUSTOM` type, optional `HH:mm` times, unique per `[doctorId, date]` → 409 on duplicate).

Routers mount under `/api/v1/<resource>` (e.g. `/api/v1/doctors`, `/api/v1/schedules`) with action-style paths: `POST /createDoctor`, `GET /getDoctors`, `GET /getDoctorById/:id`, `PATCH /updateDoctor/:id`, `DELETE /deleteDoctor/:id` (and the analogous `*Schedule*` set). Each controller wraps its body in `try/catch`, returning `sendSuccess(...)` on success and `sendError(res, error)` on failure. Endpoints are documented centrally in `config/swagger.ts` (not via route comments) and surface at `/api-docs`.

`getDoctors` is **server-paginated**: query params `page` (default 1), `limit` (default 10, max 100), optional `search` (case-insensitive match on name/speciality/department) and `status` (`active`/`inactive`); its `data` is `{ items, total, page, limit }` (not a bare array). `getDoctorById` includes the doctor's `schedules`.

`getAppointments` is likewise **server-paginated** (`page`/`limit`, optional `doctorId`, `status` (`AppointmentStatus`), `search` on patient name) returning `{ items, total, page, limit }`; appointment list/getById responses **include** the related `doctor` (`id`, `name`, `speciality`).

A read-only **`analytics`** resource (`/api/v1/analytics`) aggregates real `doctor`/`appointment` data — `GET /getDashboardStats` and `GET /getAnalytics` — composing Prisma counts/`groupBy`/`distinct` (`data/analytics.data.ts`) with pure bucketing/average helpers (`helpers/analytics.ts`); no Patient entity exists, so "patients" is the count of distinct `patientName`s on appointments.

`createDoctor` optionally accepts a `schedules[]` array and creates the doctor + weekly slots in one nested Prisma write (serves the single admin form), returning the doctor with `schedules` included. Individual slot edits go through the `schedules` resource, not `updateDoctor` (which does not touch schedules). The `schedules` list endpoint filters by a required `doctorId` query param.

A **multi-agent receptionist** (`src/agents/`) is exposed at `POST /api/v1/agent/chat` (`{ sessionId, message, patientName?, email? }` → `{ reply, route }`) via `runAgent()` (`agents/index.ts`) — the single entry **also driven by the voice pipeline**. It's a hand-built **LangGraph.js v1 `StateGraph`** with a **Zod state schema** (`agents/state.ts`): `START → guardrail → supervisor → {faq | appointment | emergency} → END`, compiled with an in-memory `MemorySaver` keyed by `sessionId` (thread_id) for multi-turn memory. The **supervisor**/**guardrail** route via `routerModel().withStructuredOutput(...)`; **FAQ** answers from RAG (`getVectorStore().similaritySearch`, never invents); **appointment** is an explicit `chatModel().bindTools([list_doctors, book_appointment])` loop whose zod-validated tools call the existing `doctors`/`appointments` `data/` functions (`createReactAgent` is deprecated in v1); the `book_appointment` tool is built per-conversation via `makeBookAppointmentTool({ patientName, patientEmail })` (bound from the caller's pre-call form), persists `patientEmail`, and on success sends a branded confirmation email via `libs/mailer.ts` (`sendAppointmentConfirmation`, Resend); **emergency** detects severity then sends an alert via `libs/mailer.ts` (`sendEmergencyAlert`, Resend) — detection and sending are separate (§5). Models/prompts/route enum live in `config/agents.ts`; `libs/chatModel.ts` exports `chatModel()` (gpt-4o) / `routerModel()` (gpt-4o-mini).

> **LangGraph + zod gotcha:** the agent code imports zod from **`zod/v4`** (not `zod`) and does `import "@langchain/langgraph/zod"`; under the API's `exactOptionalPropertyTypes`, LangChain v1's tool/state typings only interop cleanly with zod v4. REST request schemas elsewhere stay on `zod` (v3). The agent files also force `apps/api` `tsconfig` to set `declaration:false`/`declarationMap:false` — the inferred LangChain/LangGraph types aren't portable for `.d.ts` emit, and this app never needs declarations. Env: `RESEND_API_KEY`, `RESEND_FROM` (default `onboarding@resend.dev`), `EMERGENCY_EMAIL` (the owner inbox; alerts no-op with a log if unset), and `CLINIC_NAME` (default `OpenClinic AI`, used to brand booking-confirmation emails). The same mailer/env drives both `sendEmergencyAlert` and `sendAppointmentConfirmation`.

### Voice pipeline (Socket.io, realtime)

The frontend **call button** (`CallFab`, bottom-right) lives on the **landing page `/` only** (`apps/web/src/app/page.tsx`, which wraps the page in `CallProvider` and renders `CallFab` + `CallOverlay` + `PreCallDialog`) — not the dashboard routes. Clicking `CallFab` (or the Hero's "Start Voice Demo" button) opens a **pre-call form** (`components/call/pre-call-dialog.tsx`) that collects the caller's **name + email** (`react-hook-form` + zod); on submit `startCall({ name, email })` connects and emits `call:start` carrying `{ patientName, email }` (the `CallStartPayload` in `@repo/shared`). It opens a full-screen call overlay (`components/call/*`, `context/call-provider.tsx`). The web client records **one utterance at a time** (`lib/audio.ts` `createUtteranceRecorder` — a fresh `MediaRecorder` per turn, since a continuous recorder only yields valid WebM from its first chunk), and on a silence-detected `user:turn-end` sends the turn's audio over Socket.io. The server (`src/sockets/`) buffers the audio per call session, and on turn-end runs the real pipeline in `sockets/handlers/voice-turn.ts`: **Deepgram STT** (`libs/deepgram.ts`, batch/prerecorded) → `runAgent()` → **ElevenLabs TTS** (`libs/elevenlabs.ts`) → emits the user caption (`transcript:final`), agent caption (`agent:response`), and spoken `tts:audio` (mp3). The caller's name/email are stored on the `CallSession` (`sockets/session.ts`) and threaded into `runAgent()` (→ agent state), so the agent remembers the name across the call; the greeting is **personalized by first name** via `config/voice.ts` `greetingFor(name)` on `call:start` (falls back to the anonymous `GREETING`). The browser plays the audio and shows live captions. The socket event contract is the single source of truth in **`@repo/shared`** (`packages/shared/src/socket.ts`) — rebuild it (`pnpm -F @repo/shared build`) after changing events. Voice config: `config/voice.ts` (`DEEPGRAM_MODEL`, `TTS_MODEL`, `GREETING`) + env `DEEPGRAM_API_KEY`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` (must be a voice the account's plan allows — free plans can't use community "library" voices; default is the premade "Sarah" `EXAVITQu4vr4xnSDxMaL`).

**Call persistence.** During a call the session (`sockets/session.ts`) buffers, in chronological order, every audio **segment** (caller WebM turns + agent MP3 turns, captured in `handlers/voice-turn.ts`) and a **transcript** (`{role,text,at}[]`). On `call:end`/`disconnect`, the gateway `cleanup` fires `helpers/callRecording.ts` `finalizeCall()` (non-blocking, fully guarded, idempotent — skips calls with no caller turn): it merges the segments into one MP3 via ffmpeg (`libs/audioMerge.ts`, `ffmpeg-static` + `fluent-ffmpeg`, `concat` filter to decode the mixed WebM/MP3 formats), uploads it to S3 (`libs/s3.ts`, key `calls/<callId>.mp3`), and writes a `Call` row (transcript JSON + `audioKey` + status). **S3 is optional infra** — env `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`; when unset, upload no-ops gracefully and the row is saved with `status: "NO_AUDIO"` (still persists the transcript). The read-only **`calls`** resource (`/api/v1/calls` — `getCalls` paginated, `getCallById` with the full transcript + a presigned playback URL) backs the **`/calls`** history page (`apps/web/src/app/(app)/calls/`: list table + detail dialog with transcript bubbles and an `<audio>` player). Segments are buffered in memory (fine for short calls; move to streaming/Redis to scale).

### Auth (Better Auth, in `apps/web`)

The **dashboard** (`(app)/*` routes) is gated by **Better Auth** (email + password); the landing page `/` and `/sign-in` stay public. Better Auth runs entirely inside `apps/web`: the server instance is `src/lib/auth.ts` (`betterAuth({...})` with its own `pg` `Pool` against the same Neon `DATABASE_URL` — it manages the `user`/`session`/`account`/`verification` tables, created via `npx @better-auth/cli migrate`), exposed through the Next route handler `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`). The browser client is `src/lib/auth-client.ts` (`createAuthClient` from `better-auth/react`). Route protection lives in **`src/proxy.ts`** — Next.js 16 renamed `middleware.ts` → `proxy.ts`; it does an optimistic `getSessionCookie(request)` check (from `better-auth/cookies`) and redirects to `/sign-in` when absent, with a `config.matcher` listing the dashboard route prefixes. Sign-in is a **custom branded form** (`src/app/sign-in/_components/sign-in-form.tsx`, `authClient.signIn.email({ email, password })` → `/dashboard`) rendered by the server `src/app/sign-in/page.tsx`. **There is no sign-up route** — it's a **single-admin** app; public sign-up is disabled via `emailAndPassword.disableSignUp` (gated by `BETTER_AUTH_ALLOW_SIGNUP`, which only the seed flips). On the landing page, the nav/hero swap **"View Dashboard"** ↔ **"Login"** based on `authClient.useSession()`. The Topbar reads the user via `authClient.useSession()` and signs out via `authClient.signOut()`. Env (`apps/web/.env`): `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (all declared in `turbo.json` `globalEnv`). Seed the admin with `pnpm -F web seed:admin` (`src/scripts/seed-admin.ts` — sets `BETTER_AUTH_ALLOW_SIGNUP=true` then calls `auth.api.signUpEmail`, idempotent; reads the credentials from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `apps/web/.env` and **fails fast if unset** — no default password ships in the repo; Better Auth has no breach check, unlike Clerk). Better Auth's tables live in the same Neon DB but are **not** in the Prisma schema, so avoid `prisma migrate dev` drift (run `prisma db pull` to adopt them if needed). The Express API (`apps/api`) is **not** auth-protected yet — a later slice can verify Better Auth sessions/JWT there.

## Database (Prisma, in `apps/api`)

- Config lives in `apps/api/prisma.config.ts` (not in `schema.prisma`): it points at `prisma/schema.prisma`, sets the datasource `url` from `env("DATABASE_URL")`, and defines migrations path + seed command (`tsx prisma/seed.ts`).
- Datasource is **PostgreSQL**; `DATABASE_URL` must be set in `apps/api/.env`.
- The Prisma client is generated to `apps/api/src/generated/prisma` (gitignored) using the new `prisma-client` generator — import the client from there, not from `@prisma/client`.
- Run Prisma commands from `apps/api/` (e.g. `pnpm exec prisma migrate dev`, `pnpm exec prisma generate`, `pnpm exec prisma db seed`). The schema defines `Doctor`, `DoctorSchedule`, `Appointment`, and `ScheduleException` (plus the `AppointmentStatus`/`DayOfWeek`/`ScheduleExceptionType` enums); an initial migration exists under `prisma/migrations/`. `prisma/seed.ts` does not exist yet.

## Conventions

- `apps/api` TypeScript is strict with extra safety flags on (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) and compiles to CommonJS; account for these when writing API code.
- `apps/web` type-checks via `next typegen && tsc --noEmit` and lints with `--max-warnings 0` (zero-warning policy).
- ESLint configs use `eslint-plugin-only-warn`, so violations surface as warnings — but the zero-max-warnings lint scripts still fail CI on them.
