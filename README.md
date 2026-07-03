<div align="center">

# 🏥 Open Clinic AI

### An open-source **AI voice receptionist** for healthcare clinics

Patients call in and talk to it like a person — it answers questions from the clinic's own documents,
books appointments against real doctor schedules, and escalates emergencies. **24/7, no one at the front desk.**

Built with a **LangGraph.js** multi-agent brain, **Deepgram** speech-to-text, and **ElevenLabs** text-to-speech,
on a **Next.js + Express + Prisma + PostgreSQL** monorepo.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white)

</div>

---

## Table of contents

- [Why Open Clinic AI](#why-open-clinic-ai)
- [Features](#-features)
- [AI architecture](#-ai-architecture)
- [Monorepo structure](#-monorepo-structure)
- [Tech stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting started](#-getting-started)
- [Commands](#-commands)
- [Environment variables](#-environment-variables)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## Why Open Clinic AI

A clinic's front desk is a bottleneck. Calls come in after hours and go to voicemail; during the day callers
wait on hold while staff juggle walk-ins. Most of those calls are the same handful of things — hours,
insurance, "can I book with a cardiologist next week?" — repetitive work that still has to be right, because a
mis-booked slot or a missed emergency is expensive. Hiring more receptionists scales linearly and still
doesn't cover nights and weekends.

**Open Clinic AI answers the phone instead.** It transcribes the caller, decides what they need, responds in a
natural voice, and takes real action — all in one continuous conversation with memory across turns. The engine
underneath is **white-label by design**: a domain-agnostic AI-receptionist pattern that this build happens to
skin for healthcare, and could just as easily point at another industry.

---

## ✨ Features

- 🎙️ **Realtime voice calls** — browser ↔ server over Socket.io: Deepgram STT → AI agent → ElevenLabs TTS,
  with live captions.
- 🧠 **Multi-agent brain (LangGraph.js)** — a guardrail + supervisor route each turn to the right specialist,
  with per-session memory.
- 📚 **RAG knowledge base** — answers questions **only** from the clinic's own uploaded documents
  (PDF / DOCX / TXT → embeddings → Pinecone). Never invents facts.
- 📅 **Appointment booking via tools** — the agent looks up doctors, checks schedules for conflicts, and books
  through the same data layer a human admin uses.
- 🚨 **Emergency escalation** — detects critical situations and emails the clinic immediately (Resend).
- 📊 **Admin dashboard** — manage doctors, schedules, appointments, analytics, and the knowledge base.
- 📞 **Call recording & history** — merges call audio (ffmpeg) to S3 and stores full transcripts, with
  playback in the dashboard.
- 🔐 **Authentication** — Better Auth email + password, single-admin, gated dashboard with a public landing page.
- 📖 **Self-documenting API** — OpenAPI served at `/api-docs` (Swagger UI).

---

## 🧠 AI architecture

Every turn flows through one **LangGraph.js `StateGraph`** with a Zod state schema and an in-memory
checkpointer keyed by `sessionId`, so the agent remembers earlier turns of the same call.

```
                 ┌─────────────┐
   START ───────▶│  guardrail  │──blocked──▶ END
                 └─────┬───────┘
                       │ ok
                 ┌─────▼───────┐
                 │ supervisor  │   routes on conversation + previous route
                 └──┬───┬───┬──┘
          faq ◀─────┘   │   └─────▶ emergency
                        ▼
                   appointment
                        │
      (faq / appointment / emergency) ───▶ END
```

- **Guardrail** — runs first, can short-circuit unsafe/irrelevant input.
- **Supervisor** — reads the recent transcript and the previous route, then routes to `faq`, `appointment`,
  or `emergency`.
- **FAQ agent** — RAG over the Pinecone vector store; answers strictly from retrieved context.
- **Appointment agent** — an explicit tool-calling loop (`list_doctors`, `book_appointment`) that checks
  schedules for conflicts before booking.
- **Emergency agent** — separates detection from notification; a mailer helper sends the alert.

**Voice pipeline:** the browser records one utterance at a time and, on detected silence, sends the turn over
Socket.io → **Deepgram** transcribes → the **agent** decides → **ElevenLabs** synthesizes speech → captions +
audio stream back to the caller.

> Deep dive: [`docs/product-overview.md`](./docs/product-overview.md) ·
> Conventions: [`docs/coding-standards.md`](./docs/coding-standards.md)

---

## 📁 Monorepo structure

```
open-clinic-ai/
├── apps/
│   ├── web/        Next.js 16 frontend — landing page, voice call UI, admin dashboard
│   └── api/        Express 5 + Prisma 7 backend — REST API, LangGraph agents, voice pipeline
├── packages/
│   ├── shared/            @repo/shared — Socket.io event contract & shared types
│   ├── eslint-config/     shared flat ESLint configs
│   └── typescript-config/ shared tsconfig bases
├── docs/           product overview + coding standards
└── turbo.json      Turborepo task pipeline
```

Managed with **[Turborepo](https://turborepo.dev)** + **pnpm workspaces**.

---

## 🛠 Tech stack

### Frontend (`apps/web`)

| Library                                         | Version | Role                              |
| ----------------------------------------------- | ------- | --------------------------------- |
| [Next.js](https://nextjs.org)                   | 16.2.0  | App Router framework              |
| [React](https://react.dev)                      | 19.2    | UI library                        |
| [TanStack Query](https://tanstack.com/query)    | 5.101   | Server-state management           |
| [Better Auth](https://better-auth.com)          | 1.6.22  | Authentication (email + password) |
| [Tailwind CSS](https://tailwindcss.com)         | 4       | Styling                           |
| [Framer Motion](https://www.framer.com/motion/) | 12.42   | Animations                        |
| [React Hook Form](https://react-hook-form.com)  | 7.80    | Forms                             |
| [Zod](https://zod.dev)                          | 3.24    | Schema validation                 |
| [Axios](https://axios-http.com)                 | 1.18    | HTTP client                       |
| [socket.io-client](https://socket.io)           | 4.8.3   | Realtime transport                |
| [Recharts](https://recharts.org)                | 3.9     | Analytics charts                  |
| [Radix UI](https://www.radix-ui.com)            | —       | Accessible UI primitives          |
| [lucide-react](https://lucide.dev)              | 1.21    | Icons                             |
| [sonner](https://sonner.emilkowal.ski)          | 2.0     | Toasts                            |

### Backend (`apps/api`)

| Library                                                                                                     | Version    | Role                     |
| ----------------------------------------------------------------------------------------------------------- | ---------- | ------------------------ |
| [Express](https://expressjs.com)                                                                            | 5.2.1      | HTTP server              |
| [Prisma](https://www.prisma.io) (+ `@prisma/adapter-pg`)                                                    | 7.8        | ORM / PostgreSQL access  |
| [@langchain/langgraph](https://langchain-ai.github.io/langgraphjs/)                                         | 1.4.7      | Multi-agent state graph  |
| [@langchain/openai](https://js.langchain.com)                                                               | 1.5.3      | LLM + embeddings         |
| [@langchain/pinecone](https://js.langchain.com)                                                             | 1.0.3      | Vector store integration |
| [@pinecone-database/pinecone](https://www.pinecone.io)                                                      | 5.1.2      | RAG vector database      |
| [@deepgram/sdk](https://deepgram.com)                                                                       | 5.5        | Speech-to-text           |
| [@elevenlabs/elevenlabs-js](https://elevenlabs.io)                                                          | 2.54       | Text-to-speech           |
| [socket.io](https://socket.io)                                                                              | 4.8.3      | Realtime voice transport |
| [Resend](https://resend.com)                                                                                | 6.16       | Emergency email alerts   |
| [@aws-sdk/client-s3](https://aws.amazon.com/s3/)                                                            | 3.x        | Call-recording storage   |
| [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) + ffmpeg-static                        | 2.1 / 5.3  | Audio merge              |
| [Multer](https://github.com/expressjs/multer)                                                               | 2.2        | File uploads             |
| [pdf-parse](https://www.npmjs.com/package/pdf-parse) / [mammoth](https://github.com/mwilliamson/mammoth.js) | 2.4 / 1.12 | Document text extraction |
| [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)                                     | 5.0        | API docs                 |
| [Zod](https://zod.dev)                                                                                      | 3.24       | Request validation       |

---

## 📦 Prerequisites

- **Node.js** ≥ 18
- **pnpm** 9 (`npm install -g pnpm`)
- **PostgreSQL** database ([Neon](https://neon.tech) free tier works great)
- API keys: **OpenAI**, **Deepgram**, **ElevenLabs**, **Pinecone** (required);
  **Resend** and **AWS S3** (optional)

---

## 🚀 Getting started

```bash
# 1. Clone
git clone https://github.com/hunainasif/openclinic.git
cd openclinic

# 2. Install all workspace dependencies
pnpm install

# 3. Configure environment
cp apps/api/.env.example apps/api/.env   # then fill in your keys
cp apps/web/.env.example apps/web/.env   # then fill in your keys

# 4. Set up the database (from the backend)
pnpm --filter api migrate:deploy         # apply committed migrations
# (for local schema changes during development, use: pnpm --filter api migrate:dev)

# 5. Create Better Auth tables + seed the admin (from the frontend)
pnpm --filter web exec @better-auth/cli migrate   # creates user/session/account/verification tables
pnpm -F web seed:admin                            # creates admin@openclinic.com / Password@123

# 6. Run everything in watch mode
pnpm dev
```

- Web app → http://localhost:3000
- API → http://localhost:5500
- API docs (Swagger) → http://localhost:5500/api-docs

> **Default admin credentials (dev):** `admin@openclinic.com` / `Password@123` — change these before deploying.

---

## 🧰 Commands

Package manager: **pnpm 9**. Run from the repo root unless noted.

| Command                 | What it does                           |
| ----------------------- | -------------------------------------- |
| `pnpm dev`              | Run all apps in watch mode (Turborepo) |
| `pnpm build`            | Build all workspaces                   |
| `pnpm lint`             | Lint (zero-warning policy)             |
| `pnpm check-types`      | Type-check all workspaces              |
| `pnpm format`           | Prettier across the repo               |
| `pnpm --filter web dev` | Run only the frontend                  |
| `pnpm --filter api dev` | Run only the backend                   |

**Backend-specific** (`pnpm --filter api <script>`):

| Script           | What it does                                               |
| ---------------- | ---------------------------------------------------------- |
| `build`          | `prisma generate && tsc` → `dist/`                         |
| `start`          | `node dist/index.js` (production)                          |
| `migrate:dev`    | Create/apply migrations in development                     |
| `migrate:deploy` | Apply committed migrations in production (non-interactive) |
| `seed`           | Run the Prisma seed script                                 |

**Production order:** `pnpm install` → `pnpm --filter api build` → `pnpm --filter api migrate:deploy` →
`pnpm --filter api start`.

> This is a pnpm/Turborepo monorepo — deploy the whole repo (or use `turbo prune api` for a minimal
> standalone bundle) so workspace dependencies resolve. `ffmpeg-static` ships a platform-specific binary, so
> install on the target OS.

---

## 🔑 Environment variables

Full templates live in [`apps/api/.env.example`](./apps/api/.env.example) and
[`apps/web/.env.example`](./apps/web/.env.example).

### Backend — `apps/api/.env`

| Variable                                                                   | Required | Purpose                                               |
| -------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `DATABASE_URL`                                                             | ✅       | PostgreSQL connection string                          |
| `PORT`                                                                     | ✅       | API port (e.g. `5500`)                                |
| `WEB_ORIGIN`                                                               | ✅       | Allowed CORS origin (default `http://localhost:3000`) |
| `OPENAI_API_KEY`                                                           | ✅       | Agent LLM + RAG embeddings                            |
| `PINECONE_API_KEY` / `PINECONE_INDEX`                                      | ✅       | RAG vector store                                      |
| `DEEPGRAM_API_KEY`                                                         | ✅       | Speech-to-text                                        |
| `ELEVENLABS_API_KEY` / `ELEVENLABS_VOICE_ID`                               | ✅       | Text-to-speech                                        |
| `RESEND_API_KEY` / `RESEND_FROM` / `EMERGENCY_EMAIL`                       | ⚪       | Emergency email alerts (no-ops if unset)              |
| `AWS_REGION` / `S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | ⚪       | Call-recording storage (degrades to transcript-only)  |

### Frontend — `apps/web/.env`

| Variable                 | Required | Purpose                                         |
| ------------------------ | -------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL`    | ✅       | Base URL of the API                             |
| `NEXT_PUBLIC_SOCKET_URL` | ✅       | Socket.io server URL                            |
| `DATABASE_URL`           | ✅       | Same DB as the API (Better Auth tables)         |
| `BETTER_AUTH_SECRET`     | ✅       | Session signing secret (`openssl rand -hex 32`) |
| `BETTER_AUTH_URL`        | ✅       | Base URL of the web app                         |

---

## 📚 Documentation

- [`docs/product-overview.md`](./docs/product-overview.md) — what the product is, the problem it solves, and
  how it's engineered.
- [`docs/coding-standards.md`](./docs/coding-standards.md) — conventions and patterns for contributors.
- [`CLAUDE.md`](./CLAUDE.md) — repo wiring reference (commands, workspace layout, Prisma setup).

---

## 🤝 Contributing

Contributions are welcome! Please open an issue to discuss significant changes first. Follow the conventions in
[`docs/coding-standards.md`](./docs/coding-standards.md), keep `pnpm lint` and `pnpm check-types` clean, and
open a pull request.

> **Suggested GitHub topics** (for discoverability): `ai-agent`, `voice-ai`, `langgraph`, `healthcare`,
> `rag`, `deepgram`, `elevenlabs`, `nextjs`, `express`, `prisma`, `typescript`, `receptionist`, `openai`.

---

## 📄 License

Released under the [MIT License](./LICENSE).

<div align="center">

**Keywords:** AI voice receptionist · healthcare AI · appointment booking agent · LangGraph.js multi-agent ·
RAG · Deepgram · ElevenLabs · Next.js · Express · Prisma · TypeScript · open source

</div>
