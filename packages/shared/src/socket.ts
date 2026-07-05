/**
 * The Socket.io event contract — the single source of truth shared by the web
 * client and the API server. Events are named `domain:action` (coding-standards
 * §4). A mismatch between the two ends is a type error, not a silent failure.
 */

export const SocketEvent = {
  // client -> server
  CallStart: "call:start",
  AudioChunk: "audio:chunk",
  UserTurnEnd: "user:turn-end",
  CallEnd: "call:end",

  // server -> client
  CallReady: "call:ready",
  TranscriptFinal: "transcript:final",
  AgentResponse: "agent:response",
  TtsAudio: "tts:audio",
  AgentSpeakingStart: "agent:speaking:start",
  AgentSpeakingStop: "agent:speaking:stop",
  CallError: "call:error",
} as const;

export type SocketEventName = (typeof SocketEvent)[keyof typeof SocketEvent];

/** Audio capture settings shared by both ends. */
export const AUDIO_TIMESLICE_MS = 250;
export const AUDIO_MIME = "audio/webm;codecs=opus";

/** Caller details collected by the pre-call form and sent with `call:start`. */
export type CallStartPayload = { patientName: string; email: string };
export type CallReadyPayload = { callId: string };
export type CallErrorPayload = { message: string };
export type TranscriptFinalPayload = { text: string };
export type AgentResponsePayload = { text: string; route: string | null };

/** Events the server emits to the client. */
export interface ServerToClientEvents {
  "call:ready": (payload: CallReadyPayload) => void;
  /** The user's transcribed utterance (caption). */
  "transcript:final": (payload: TranscriptFinalPayload) => void;
  /** The agent's reply text (caption). */
  "agent:response": (payload: AgentResponsePayload) => void;
  /** The agent's spoken reply as mp3 audio. */
  "tts:audio": (audio: ArrayBuffer) => void;
  "agent:speaking:start": () => void;
  "agent:speaking:stop": () => void;
  "call:error": (payload: CallErrorPayload) => void;
}

/** Events the client emits to the server. */
export interface ClientToServerEvents {
  /** Starts the call; carries the caller's name/email from the pre-call form. */
  "call:start": (payload: CallStartPayload) => void;
  /** Binary mic audio (webm/opus). Arrives as a Buffer on the server. */
  "audio:chunk": (chunk: ArrayBuffer) => void;
  "user:turn-end": () => void;
  "call:end": () => void;
}
