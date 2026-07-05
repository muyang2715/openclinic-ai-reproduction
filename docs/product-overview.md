# Open Clinic AI — Product Overview

> An AI **voice receptionist** platform. Patients call in and talk to it like a person; it answers their
> questions from the clinic's own documents, books appointments against real doctor schedules, and escalates
> emergencies — 24/7, with no one at the front desk.

This document is the single place to understand **what the product is, the problem it solves, and how it's
engineered**. For day-to-day repo wiring see [`../CLAUDE.md`](../CLAUDE.md); for how we write code see
[`./coding-standards.md`](./coding-standards.md). The three together form the product's reference set.

---

## The problem

A clinic's front desk is a bottleneck. Calls come in after hours and go to voicemail. During the day, callers
wait on hold while staff juggle walk-ins. Most of those calls are the same handful of things — "What are your
hours?", "Do you take my insurance?", "Can I book with a cardiologist next week?" — repetitive work that still
has to be right, because a mis-booked slot or a missed emergency is expensive. Hiring more receptionists
scales linearly and still doesn't cover nights and weekends.

The result is lost bookings, frustrated patients, and staff spending their day on rote phone work instead of
the patients in front of them.

## What the product does

Open Clinic AI answers the phone. A caller speaks; the system transcribes them, decides what they need,
responds in a natural voice, and takes action — all in one continuous conversation with memory across turns.
It handles three jobs:

- **Answers questions** from the clinic's **own knowledge base** (uploaded documents), never inventing facts.
- **Books appointments** by looking up doctors, checking their schedules for conflicts, and creating the
  booking — driven by the model calling real tools, not by scripted menus.
- **Escalates emergencies** — when it detects a critical situation, it notifies the clinic immediately by
  email instead of trying to handle it itself.

Behind the phone line sits an **admin dashboard**: manage doctors and their weekly schedules, view and filter
appointments, upload knowledge-base documents, review analytics, and listen back to recorded calls with full
transcripts.

## White-label by design, health-tech by focus

The engine underneath is **domain-agnostic**. It's a general pattern for an AI receptionist: a safety
guardrail, a supervisor that routes each turn, a set of swappable **specialist agents**, a retrieval-augmented
knowledge base, and a realtime voice pipeline. Point that pattern at a different industry — a law office, a
salon, a property manager — and you have a different product.

**This build is skinned for healthcare.** It acts as a clinic's healthcare assistant, and its booking agent is
built around **doctors, specialities, and schedules**. When re-skinning for another vertical, what changes is
narrow; what stays is the whole platform:

| Re-skin swaps (per industry)                          | Stays the same (the platform)                          |
| ----------------------------------------------------- | ------------------------------------------------------ |
| The knowledge-base content (the RAG source documents) | The voice pipeline (STT → agent → TTS over Socket.io)  |
| The specialist agents & their tools (e.g. "booking")  | The guardrail + supervisor routing graph               |
| The domain tables (doctors, appointments, schedules)  | Auth, the dashboard shell, call recording & history    |
| The prompts and branding                              | The monorepo structure and the shared contract package |

---

## How it works — the multi-agent brain (LangGraph.js)

The decision-making is a **LangGraph.js `StateGraph`** ([`apps/api/src/agents/graph.ts`](../apps/api/src/agents/graph.ts)).
Every turn flows through the same graph, and per-conversation memory is kept by an in-memory `MemorySaver`
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

- **State is a Zod schema** ([`agents/state.ts`](../apps/api/src/agents/state.ts)) — messages, the caller's
  input, the chosen `route`, and flags like `blocked`. Typing the state with Zod is what lets LangGraph and
  the LLM tool-calls interop safely.
- **Guardrail** ([`guardrail.node.ts`](../apps/api/src/agents/guardrail.node.ts)) runs first and can short-
  circuit straight to `END` if a message should be blocked.
- **Supervisor** ([`supervisor.node.ts`](../apps/api/src/agents/supervisor.node.ts)) is the router. It reads
  the recent conversation transcript **and the previous route** (which persists in the checkpointed state) and
  picks one of `faq | appointment | emergency` via a structured-output model. Passing prior context is what
  keeps a multi-turn booking from being misrouted to FAQ when the caller answers with just a name or a time.
- **FAQ agent** ([`faq.node.ts`](../apps/api/src/agents/faq.node.ts)) answers **only** from retrieved
  knowledge-base context (RAG over a Pinecone vector store). It never hard-codes answers.
- **Appointment agent** ([`appointment.node.ts`](../apps/api/src/agents/appointment.node.ts)) is an explicit
  tool-calling loop. The model is bound to two Zod-validated tools
  ([`tools/appointment.tools.ts`](../apps/api/src/agents/tools/appointment.tools.ts)):
  - `list_doctors` — searches active doctors by name / speciality / department.
  - `book_appointment` — resolves the doctor (by id or a name/speciality search), **checks the schedule for an
    overlapping booked appointment**, and only then creates the appointment. On a clash it asks for another
    slot; with no match it offers the available doctors. On success it stores the caller's email on the
    appointment and sends a **branded confirmation email** (Resend). The tool is built per-conversation from
    the caller's pre-call details, so the booking uses the real name/email rather than model-supplied values.

  Both tools call the same `data/` functions the REST API uses, so the agent books through exactly the code
  path a human admin would.

- **Emergency agent** ([`emergency.node.ts`](../apps/api/src/agents/emergency.node.ts)) keeps **detection and
  notification separate**: it decides severity, then a mailer helper sends the alert. The bar for triggering
  stays explicit and reviewable.

Adding a fourth specialist is additive — a new node and a supervisor route — without touching the others. The
whole graph is reachable as one function, `runAgent()` ([`agents/index.ts`](../apps/api/src/agents/index.ts)),
which both the REST endpoint (`POST /api/v1/agent/chat`) and the voice pipeline call.

## How it works — the realtime voice pipeline

The voice loop is realtime and socket-driven, so it lives outside the request/response controllers as a
**pipeline of small functions** under [`apps/api/src/sockets/`](../apps/api/src/sockets/).

0. Before the call connects, a **pre-call form** collects the caller's **name and email**. The name is
   threaded through the whole call (so the agent greets them by first name and remembers it), and the email is
   used to send the booking confirmation.
1. The browser records **one utterance at a time** and, on detected silence, sends that turn's audio over
   **Socket.io**.
2. The server buffers the turn and runs it through
   [`handlers/voice-turn.ts`](../apps/api/src/sockets/handlers/voice-turn.ts): **Deepgram** speech-to-text →
   `runAgent()` → **ElevenLabs** text-to-speech.
3. It emits the caller's caption, the agent's caption, and the spoken audio back; the browser plays the reply
   and shows live captions. The agent greets the caller **by first name** on connect.

The **socket event contract is the single source of truth** in the shared package
([`packages/shared`](../packages/shared)), imported on both ends so the client and server can't drift.

**Call persistence.** Each session buffers every audio segment (caller + agent turns) and a structured
transcript. When the call ends, a finalizer merges the segments into one MP3 with ffmpeg, uploads it to S3,
and writes a `Call` row (transcript + audio key). S3 is **optional infrastructure** — with no bucket
configured the upload no-ops and the row is still saved with the transcript. The read-only `calls` resource
backs the dashboard's call-history page (list + detail with transcript bubbles and an audio player).

---

## Engineering — the backend (`apps/api`)

**Express 5 + Prisma 7 + PostgreSQL, in strict TypeScript.** The architecture is deliberately **flat — no
service layer** — with a one-directional dependency rule:

```
routes → controllers → helpers → data → (Prisma client)
```

- **`routes/`** wire an HTTP path to a controller; no logic.
- **`controllers/`** hold the logic: validate input with Zod, do the work, respond.
- **`helpers/`** are reusable plain functions extracted from controllers.
- **`data/`** are thin Prisma wrappers — **the only place the database is queried**. A controller never touches
  the Prisma client directly, so there's still one place to change when the schema moves.

Every response goes through shared helpers ([`helpers/apiResponse.ts`](../apps/api/src/helpers/apiResponse.ts)):
`sendSuccess` → `{ success, message, data }` and `sendError`, which maps typed `AppError`s, Zod errors (400),
and Prisma errors (404/409) to a consistent `{ success, message }` envelope — **one source of truth** for
status mapping, whether an error is caught in a controller or the final error-handler middleware. Strict
compiler flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) are on, so the types model reality
rather than being fought with `as any`.

Domain resources (each with its own route/controller/data trio): **doctors**, **schedules**, **appointments**,
**exceptions** (per-doctor availability overrides), a read-only **analytics** aggregate, the **knowledge-base**
(document upload → chunking → embeddings → Pinecone), read-only **calls**, and the **agent** chat endpoint.
List endpoints are server-paginated (`page`/`limit` + filters) returning `{ items, total, page, limit }`.

## Engineering — API documentation

The API is documented with **OpenAPI, maintained centrally** in
[`apps/api/src/config/swagger.ts`](../apps/api/src/config/swagger.ts) (`paths` + `components.schemas`) and
served by `swagger-ui-express` at **`GET /api-docs`**. Route files stay routing-only — no doc comments
scattered across them — so the spec is one artifact to read and keep in sync. Endpoints live under
`/api/v1/<resource>` with explicit action-style paths (e.g. `POST /createDoctor`, `GET /getDoctors`).

## Engineering — the frontend (`apps/web`)

**Next.js 16 (App Router) + React 19**, styled with **Tailwind v4** and a local shadcn-style component library
(`src/components/ui`). The app has two faces: a **public landing page** (with the live voice-call demo) and an
**auth-gated admin dashboard**.

- **Server state is TanStack Query only**, in a strict three-layer split: a single configured Axios instance →
  one plain function per endpoint in `services/` (knows nothing about React) → a `useQuery`/`useMutation` hook
  in `hooks/` that components consume. Components import hooks, never services or Axios directly.
- **Forms** use react-hook-form + Zod.
- **Routes own their components**: route-specific UI is colocated in a `_components/` folder; only truly shared
  UI graduates to `src/components/`.
- **Sockets** are wrapped once with events typed from the shared contract; components subscribe through a hook.
- **Auth** is **Better Auth** (email + password, single-admin). The dashboard routes are gated in
  [`apps/web/src/proxy.ts`](../apps/web/src/proxy.ts) (Next 16's renamed middleware) via an optimistic
  session-cookie check that redirects to a custom branded `/sign-in`; the landing page stays public. The nav,
  hero, and topbar react to the live session.

## Engineering — the monorepo

A **Turborepo monorepo managed with pnpm**. Turbo orchestrates task ordering and caching across workspaces.

```
apps/
  web/        Next.js frontend (landing + dashboard)
  api/        Express + Prisma backend (REST + agents + voice)
packages/
  shared/            @repo/shared — the cross-wire contract (Socket.io events, shared types)
  eslint-config/     shared flat ESLint configs
  typescript-config/ shared tsconfig bases
```

`@repo/shared` is the spine: anything needed on **both** sides of the wire (the socket event contract, shared
types) lives there and is never redeclared per app. Common commands from the root: `pnpm dev` (all apps in
watch mode), `pnpm build`, `pnpm lint`, `pnpm check-types`. The backend runs its own Prisma tooling from
`apps/api`.

---

## Tech stack at a glance

| Layer                     | Technology                                               | Why                                                              |
| ------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| Agent orchestration       | LangGraph.js `StateGraph` + `@langchain/openai` (OpenAI) | Explicit, inspectable multi-agent routing with per-session state |
| Retrieval (RAG)           | Pinecone + LangChain embeddings/text-splitters           | Answers grounded in the clinic's own documents                   |
| Speech-to-text            | Deepgram                                                 | Fast, accurate transcription on the voice hot path               |
| Text-to-speech            | ElevenLabs                                               | Natural spoken responses                                         |
| Realtime transport        | Socket.io                                                | Bidirectional streaming of audio turns + captions                |
| Backend                   | Express 5, TypeScript (strict)                           | Flat, predictable, no-service-layer API                          |
| Database / ORM            | PostgreSQL + Prisma 7                                    | Typed data access behind a single `data/` boundary               |
| Call recording            | ffmpeg (merge) + AWS S3 (storage)                        | One MP3 per call; optional infra, degrades gracefully            |
| Emails (alerts + booking) | Resend (email)                                           | Emergency escalation + branded booking confirmations             |
| Frontend                  | Next.js 16, React 19, Tailwind v4, TanStack Query        | App-Router UI with disciplined server-state handling             |
| Auth                      | Better Auth (email + password, single admin)             | Session-gated dashboard; public landing page                     |
| Monorepo / tooling        | Turborepo + pnpm workspaces                              | Shared contract + configs, cached tasks                          |

---

## The through-line

Three ideas run through the whole product. **Latency is the product** — the speech-to-response path is kept
fast and predictable, because the caller hears every delay. **The contract is law** — one shared source of
truth for the socket events and types means the frontend and backend can't drift. And **the platform is
white-label-ready** — a domain-agnostic agent engine that this build happens to point at healthcare, and could
just as easily point elsewhere.
