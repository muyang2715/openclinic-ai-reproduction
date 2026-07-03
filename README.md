# Open Clinic AI

An AI voice receptionist platform for clinics — a multi-agent LangGraph receptionist that answers FAQs from a RAG knowledge base, books appointments, and escalates emergencies, reachable by a realtime voice call (Deepgram STT → agent → ElevenLabs TTS over Socket.io), with a Better Auth-gated admin dashboard for doctors, schedules, appointments, analytics, call history, and knowledge-base management.

## Monorepo layout

Turborepo + pnpm workspaces:

- `apps/web` — Next.js 16 / React 19 frontend: public landing page with the voice-call demo, custom sign-in, and the admin dashboard.
- `apps/api` — Express 5 + Prisma 7 (PostgreSQL) backend: REST API (`/api/v1`, Swagger at `/api-docs`), the LangGraph agent, and the Socket.io voice pipeline.
- `packages/shared` — shared TypeScript contracts (Socket.io event contract).
- `packages/eslint-config`, `packages/typescript-config` — shared lint/tsconfig bases.

## Getting started

```sh
pnpm install
pnpm dev              # run everything in watch mode
pnpm build            # build all workspaces
pnpm lint             # lint (zero-warning policy)
pnpm check-types      # typecheck
```

Environment: `apps/api/.env` (database, OpenAI, Deepgram, ElevenLabs, Pinecone, Resend, S3) and `apps/web/.env` (API/socket URLs, Better Auth). Seed the dashboard admin with `pnpm -F web seed:admin`.

See `CLAUDE.md` for the full architecture and conventions reference.
