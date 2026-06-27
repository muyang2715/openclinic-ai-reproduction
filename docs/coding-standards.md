# open-clinic-ai — Coding Standards

> **Standards over speed.** If a rule here conflicts with something you're about to write, fix the code, not the rule.

This is the conventions-and-patterns layer for the repo. It documents _how we write code_, not _how the repo is wired_ — that lives in [`CLAUDE.md`](../CLAUDE.md) (commands, workspace layout, Prisma client location, tsconfig flags). Read CLAUDE.md first; this file assumes it.

Scope: applies to `apps/api`, `apps/web`, and `@repo/*` packages. Examples use the project's real stack.

---

## 0. What this app is (one paragraph)

A voice agent for a clinic. A caller connects, audio streams to the backend over Socket.io, Deepgram does STT, an LLM (OpenAI) decides a response, ElevenLabs does TTS, and audio streams back. Three agents handle the work: a **FAQ agent** (RAG over a documents knowledge base), an **appointment agent** (book / cancel / reschedule), and an **emergency agent** (detects a critical condition and emails the doctor immediately). Core domain tables: doctors, appointments, doctor exceptions (availability), documents (RAG source).

Latency is the product. Most rules below exist to keep the STT→LLM→TTS path fast and predictable.

---

## 1. Core principles

1. **One source of truth for shared meaning.** Types, zod schemas, constants, and the socket-event contract that _both_ `apps/api` and `apps/web` rely on live in `@repo/shared`. Never redeclare them on each side.
2. **Validate at every boundary.** Anything entering the system — HTTP bodies, socket payloads, LLM tool outputs, env vars — is parsed with zod before use. Inside the boundary, trust the types.
3. **Logic in controllers, data behind functions.** Route handlers and socket handlers do wiring only; business logic lives in controllers. Reusable pieces become helper functions, and the database is touched only behind named `data/` functions — no service layer in between.
4. **No magic values.** Model names, voice IDs, socket event names, enums, error codes — all named constants, never string literals at call sites.
5. **Secrets never cross to the client.** Deepgram, OpenAI, ElevenLabs, and `DATABASE_URL` live only in `apps/api`. The frontend gets URLs, never keys. (See Rule #7.)

---

## 2. Backend architecture (`apps/api`)

We use a deliberately flat Express app — **no service layer.** Business logic lives in controllers; anything reusable is pulled out into plain helper functions. Each part has one job. **Paths below are illustrative of the _roles_, not a map to memorize** — discover the real files in the repo; don't trust this list once the code moves.

| Layer          | Responsibility                                                                           | May import         |
| -------------- | ---------------------------------------------------------------------------------------- | ------------------ |
| `routes/`      | Express routers. Wiring only — attach middleware + controller. No logic.                 | controllers        |
| `controllers/` | The logic lives here: validate input (zod), do the work, call helpers/data, respond.     | helpers, data, lib |
| `helpers/`     | Reusable functions extracted from controllers. Plain functions, no shared mutable state. | data, lib          |
| `data/`        | Thin Prisma wrappers (a.k.a. repositories). **The only place the client is queried.**    | prisma client      |
| `agents/`      | The three LangGraph agents + the voice-pipeline orchestration.                           | helpers, data, lib |
| `sockets/`     | Socket.io gateway + handlers. Wiring only — validate payload, call a pipeline function.  | agents, helpers    |
| `lib/`         | External clients + their call functions: prisma, openai, deepgram, elevenlabs, mailer.   | —                  |
| `middleware/`  | Cross-cutting: error handler, auth, request context.                                     | —                  |
| `config/`      | Env loading + zod validation. Nothing reads `process.env` directly elsewhere.            | —                  |

**The dependency rule still holds, just shorter:** `routes → controllers → helpers → data`. A lower layer never imports an upper one. A controller may call helpers and `data/` functions, but it never touches the Prisma client directly, and a `data/` function never knows about HTTP.

---

## 3. Iron Rules (with examples)

### Rule #1 — No magic values

Voice IDs, model names, socket events, and enums are constants in `@repo/shared`.

```ts
// ❌ BAD
socket.on("audio_chunk", ...);
const completion = await openai.chat.completions.create({ model: "gpt-4o", ... });
if (appointment.status === "cancelled") { ... }

// ✅ GOOD
import { SocketEvent, OPENAI_MODEL, AppointmentStatus } from "@repo/shared";

socket.on(SocketEvent.AudioChunk, ...);
const completion = await openai.chat.completions.create({ model: OPENAI_MODEL, ... });
if (appointment.status === AppointmentStatus.Cancelled) { ... }
```

Why it matters here specifically: a mistyped socket event name fails silently (the listener just never fires). Constants make that a compile error.

### Rule #2 — Validate at the boundary with zod

Controllers and socket handlers never trust their input. Define the schema in `@repo/shared` so the frontend form can reuse it.

```ts
// ❌ BAD
export const bookAppointment = (req: Request, res: Response) => {
  return appointmentService.book(req.body); // req.body is `any`
};

// ✅ GOOD
import { bookAppointmentSchema } from "@repo/shared";

export const bookAppointment = (req: Request, res: Response) => {
  const dto = bookAppointmentSchema.parse(req.body); // typed + validated
  return appointmentService.book(dto);
};
```

This applies to **LLM tool outputs too** — when an agent calls a "book appointment" tool, parse the model's arguments with zod before acting on them. The model is an untrusted boundary.

### Rule #3 — Keep controllers focused; extract reusable logic into helpers

Logic lives in the controller. When a controller gets long, or a piece of logic is needed in more than one place, pull _that piece_ into a named helper function — don't grow a service layer.

```ts
// ❌ BAD — same availability math copy-pasted across controllers
export const bookAppointment = async (req, res) => {
  const dto = bookAppointmentSchema.parse(req.body);
  // 30 lines of slot/availability checking inline...
  // ...and the same 30 lines appear again in rescheduleAppointment
};

// ✅ GOOD — the reusable bit becomes a helper; the controller reads top-to-bottom
import { isSlotAvailable } from "../helpers/availability";

export const bookAppointment = async (req, res) => {
  const dto = bookAppointmentSchema.parse(req.body);
  if (!(await isSlotAvailable(dto.doctorId, dto.start))) {
    throw new AppError(ErrorCode.SlotTaken, "That time is no longer free", 409);
  }
  const appointment = await createAppointment(dto); // data/ function
  res.json(appointment);
};
```

Rule of thumb: a helper is a plain function with clear inputs and outputs. If you're reaching for a class with injected dependencies and internal state, stop — that's the service layer we're choosing not to have.

### Rule #4 — Prisma only in the data layer

The generated client is imported **from `src/generated/prisma`** (per CLAUDE.md), wrapped once in a `lib/prisma` singleton, and queried only inside `data/` functions. Controllers call those functions, never the client directly.

```ts
// lib/prisma.ts — the ONLY place the client is constructed
import { PrismaClient } from "../generated/prisma";
export const prisma = new PrismaClient();

// data/appointment.ts — the ONLY place it's queried
import { prisma } from "../lib/prisma";
export const findDoctorAppointments = (doctorId: string) =>
  prisma.appointment.findMany({ where: { doctorId } });
```

```ts
// ❌ BAD — controller reaching into Prisma directly
const appts = await prisma.appointment.findMany({ where: { ... } });
```

Keeping every query behind a named function means there's still one place to change when the schema moves — even without a service layer. It's also why we kept Prisma inside `apps/api` rather than a shared package: fine, as long as this one boundary holds.

### Rule #5 — The voice pipeline is composed of functions, not one monolith

The one place flat controllers don't fit is the realtime voice loop — it's multi-step and socket-driven, not request/response. Keep it organized as a **pipeline of small functions** under `agents/`, each doing one thing, composed by one orchestration function the socket handler calls. No god-function, no service class.

```ts
// ✅ GOOD — agents/voice-pipeline.ts: one orchestrator function, composed steps
export const handleAudioTurn = async (sessionId: string, audio: Buffer) => {
  const transcript = await transcribe(audio); // lib/deepgram
  const reply = await routeToAgent(sessionId, transcript); // picks FAQ/booking/emergency
  await streamSpeech(sessionId, reply); // lib/elevenlabs
};
```

Each step (`transcribe`, `routeToAgent`, `streamSpeech`) is its own function doing one of {transcribe, decide, synthesize, persist, email}. If one starts doing two, split it. The socket handler just calls `handleAudioTurn` — it never inlines the steps.

### Rule #6 — Errors are typed; responses go through shared helpers

Throw a typed `AppError` (`code`, `message`, `status`) for expected failures. Controllers wrap their body in `try/catch` and funnel **both** paths through the helpers in `helpers/apiResponse.ts` — they never hand-build a `res.json(...)` shape inline.

- `sendSuccess(res, status, message, data?)` → `{ success: true, message, data }`
- `sendError(res, error)` → maps `AppError` (its status), `ZodError` (→400), Prisma `P2025` (→404) / `P2002` (→409), else 500, all as `{ success: false, message }`.

```ts
// ✅ GOOD
import { AppError } from "../errors/AppError";
import { sendSuccess, sendError } from "../helpers/apiResponse";

export const getDoctor = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const doctor = await findDoctorById(req.params.id);
    if (!doctor) throw new AppError("DOCTOR_NOT_FOUND", "No such doctor", 404);
    return sendSuccess(res, 200, "Doctor fetched successfully", doctor);
  } catch (error) {
    return sendError(res, error);
  }
};
```

`middleware/errorHandler.ts` reuses the same `sendError` as a final safety net. Keep the status mapping in `sendError` only — one source of truth, whether an error is caught in a controller or escapes to the middleware.

Standard envelopes (the only shapes the API returns):

```jsonc
{ "success": true,  "message": "Doctor fetched successfully", "data": { } }
{ "success": false, "message": "No such doctor" }
```

> `AppError` codes are plain strings today and will graduate to an `ErrorCode` enum in `@repo/shared` once that package exists.

### Rule #7 — Secrets stay server-side; side-effects go through services

LLM/STT/TTS keys and `DATABASE_URL` live only in `apps/api/.env`. The frontend only ever gets `NEXT_PUBLIC_*` URLs. Anything `NEXT_PUBLIC_` is shipped to the browser — treat it as public.

External side-effects (email, third-party calls) go through a `lib/` function, never inline at the call site. The emergency agent does **not** build and send mail itself:

```ts
// ✅ GOOD — emergency agent detects, lib/mailer sends
import { sendEmergencyAlert } from "../lib/mailer";
await sendEmergencyAlert(doctor.email, patientCondition);
```

---

## 4. The voice pipeline & sockets

- **The socket-event contract is law.** Every event (name + payload shape) is defined once in `@repo/shared` and imported on both ends. The frontend and backend cannot drift, because a mismatch is a type error.
- **Name events `domain:action`**, e.g. `audio:chunk`, `transcript:partial`, `transcript:final`, `agent:response`, `tts:audio`, `call:end`.
- **Stream, don't buffer, on the hot path.** Partial transcripts and TTS audio are emitted incrementally. Buffering the whole turn before responding adds latency the user hears.
- **One session = one source of truth.** Per-call state (id, agent in control, history) lives in a session store keyed by socket (a `Map` or Redis behind a small set of helper functions). Handlers stay stateless.

---

## 5. The three agents

- Each agent (FAQ / appointment / emergency) is a self-contained module under `agents/` exposing a single entry the router can call. Adding a fourth agent must not require editing the other three.
- **Agent tools are validated** (Rule #2): the model's tool arguments are parsed with zod before any real action (DB write, email) runs.
- **FAQ agent (RAG):** retrieval lives in a `retrieveContext()` helper; the agent asks for context, it doesn't query the vector store itself. Knowledge-base documents are the `documents` table / vector source — never hard-code answers.
- **Emergency agent:** detection and notification are separate. The agent decides "this is an emergency"; a `sendEmergencyAlert()` helper (wrapping the mailer in `lib/`) sends. Keep the bar for triggering explicit and reviewable.

---

## 6. Frontend conventions (`apps/web`)

### File organization — routes own their components

Only truly shared components are global; everything else lives next to the route that uses it.

- **Pages** are App-Router routes: `src/app/<route>/page.tsx`. The folder name _is_ the URL — `src/app/about/page.tsx` → `/about`.
- **Route-specific components** are colocated in a `_components/` folder inside that route: `src/app/about/_components/GloryCard.tsx`. The leading underscore is a Next.js **private folder** — it's excluded from routing, so it never becomes a URL. Use it for anything only that one route renders.
- **Shared components** — used by more than one route (Navbar, Header, Footer, Button) — live in `src/components/`: `src/components/Navbar.tsx`.

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # /
│   └── about/
│       ├── page.tsx             # /about
│       └── _components/
│           └── GloryCard.tsx    # only used by /about
└── components/
    └── Navbar.tsx               # used across routes
```

**The graduation rule:** a component starts in its route's `_components/`. The moment a _second_ route needs it, move it to `src/components/`. Don't pre-emptively make things shared — and never import one route's `_components/` from another route. If you're tempted to, that's the exact signal to graduate it to `src/components/`.

**Naming:** component files are `PascalCase.tsx` and match the component they export (`GloryCard.tsx` exports `GloryCard`). The same `_`-prefix colocation works for route-local hooks or utils (`_hooks/`, `_lib/`) when a route needs its own.

### Server state vs UI state — never mix them

- **Server state → TanStack Query only.** No `fetch`/`axios` inside `useEffect`. One hook per resource.
- **Client/UI state → Zustand only.** Never copy server data into a Zustand store; query is the cache.

```ts
// ❌ BAD — fetching in a component, server data in local state
useEffect(() => {
  axios.get("/doctors").then((r) => setDoctors(r.data));
}, []);

// ✅ GOOD — a query hook that calls a service function (see "API calls" below)
export const useDoctors = () =>
  useQuery({ queryKey: ["doctors"], queryFn: getDoctors });
```

### API calls — endpoint functions in `services/`, hooks consume them

Three layers, each with one job. Never collapse them:

1. **`src/lib/api.ts`** — the one configured Axios instance (base URL, interceptors). Transport only.
2. **`src/services/<resource>.ts`** — one plain function per endpoint. It calls the axios instance and returns typed data. Knows nothing about React.
3. **`src/hooks/use<Resource>.ts`** — TanStack Query hooks (`useQuery` / `useMutation`) that call the service functions. The only data layer a component imports.

```ts
// src/services/notes.ts — endpoint functions, one per API call
import { api } from "@/lib/api";
import type { Note, CreateNoteInput } from "@repo/shared";

export const getNotes = () => api.get<Note[]>("/notes").then((r) => r.data);

export const createNote = (input: CreateNoteInput) =>
  api.post<Note>("/notes", input).then((r) => r.data);
```

```ts
// src/hooks/useNotes.ts — TanStack Query wraps the service functions
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotes, createNote } from "@/services/notes";

export const useNotes = () =>
  useQuery({ queryKey: ["notes"], queryFn: getNotes });

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notes"] }),
  });
};
```

The boundaries, as rules:

- **Components import hooks, never services or axios.** A component never sees `getNotes` or `api.get` directly.
- **Services never touch React** — no hooks, no query client, just request in and typed data out. This makes them trivially reusable and testable.
- **Query keys are arrays, resource-first:** `["notes"]`, `["notes", id]`. Mutations invalidate the keys they affect (`onSuccess`).
- **Production naming:** the folder is `src/services/` (nest as `src/services/api/` if you prefer). Pick one and stay consistent. Types and input shapes come from `@repo/shared`, so the service signatures match what the API validates.

### Forms

`react-hook-form` + zod, and the zod schema is **imported from `@repo/shared`** — the same schema the API validates against. One schema, both sides.

### Sockets

- The socket client is wrapped once, with events typed from `@repo/shared`. Components subscribe through a hook, not by touching the raw socket.

### Components

- Business logic lives in hooks; components render. A component with a `useEffect` doing data work is a smell — extract it.

---

## 7. `@repo/shared` — the contract package

This package is the spine of the monorepo. It holds, and is the **only** home for:

- Domain types and enums (`AppointmentStatus`, `AgentType`, …)
- zod schemas reused by API validation _and_ frontend forms
- Constants (model names, socket event names, error codes)
- The `AppError` class + `ErrorCode` enum

> ⚠️ It doesn't exist in the repo yet — the current packages are `ui`, `eslint-config`, `typescript-config`. Creating `@repo/shared` is an early setup task. Until it exists, the rules above have nowhere to point.

Rule: if a value or type is needed on both sides of the wire, it goes here. If it's only needed on one side, it stays in that app.

---

## 8. General conventions

- **TypeScript is strict** (`apps/api` adds `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Don't fight the compiler with `as any` — model the types properly.
- **Async:** always `await` or explicitly `.catch`. No floating promises, especially on the voice path.
- **Logging:** structured logs with a request/session id. No `console.log` left in committed code (allowed only behind a debug flag).
- **No dead code / commented-out blocks** in commits. Git is the history.
- **API docs:** the OpenAPI spec is maintained centrally in `config/swagger.ts` (`definition.paths` + `components.schemas`), so route files stay routing-only — no `@openapi` comments. It's served with `swagger-ui-express` at `/api-docs`. When you add an endpoint, add its `paths` entry (and any new `components.schemas`) in `config/swagger.ts`. (Hand-written today — fold into the zod schemas if drift becomes a problem.)

---

## 9. Maintenance

This document is code. When you add a library, change a layer's responsibility, or alter the socket contract, **update this file in the same PR**. A reviewer should reject a PR that changes a convention without updating the rule. Keep it lean — delete a rule the moment the codebase makes it obvious or a linter enforces it.
