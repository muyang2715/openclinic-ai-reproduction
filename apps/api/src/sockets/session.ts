import { randomUUID } from "crypto";

// Per-call state, keyed by socket id (coding-standards §4 — session is the one
// source of truth; handlers stay stateless). In-memory Map for now; swap for
// Redis if we scale to multiple instances.

export type CallRole = "user" | "agent";

export type AudioSegment = {
  role: CallRole;
  audio: Buffer;
  format: "webm" | "mp3";
  at: number;
};

export type TranscriptEntry = {
  role: CallRole;
  text: string;
  at: number;
};

export type CallSession = {
  callId: string;
  socketId: string;
  startedAt: number;
  bytesReceived: number;
  agentSpeaking: boolean;
  audioChunks: Buffer[];
  // Full-call recording buffers, kept in chronological order for finalization.
  segments: AudioSegment[];
  transcript: TranscriptEntry[];
  userTurns: number;
  // Caller details from the pre-call form (optional — old clients may omit them).
  patientName?: string;
  email?: string;
};

const sessions = new Map<string, CallSession>();

export const createSession = (
  socketId: string,
  meta?: { patientName?: string; email?: string },
): CallSession => {
  const session: CallSession = {
    callId: randomUUID(),
    socketId,
    startedAt: Date.now(),
    bytesReceived: 0,
    agentSpeaking: false,
    audioChunks: [],
    segments: [],
    transcript: [],
    userTurns: 0,
    ...(meta?.patientName ? { patientName: meta.patientName } : {}),
    ...(meta?.email ? { email: meta.email } : {}),
  };
  sessions.set(socketId, session);
  return session;
};

export const getSession = (socketId: string): CallSession | undefined =>
  sessions.get(socketId);

// Buffer one turn's audio; drain returns + clears it as a single Buffer.
export const appendAudio = (socketId: string, chunk: Buffer): void => {
  const session = sessions.get(socketId);
  if (!session) return;
  session.audioChunks.push(chunk);
  session.bytesReceived += chunk.byteLength;
};

export const drainAudio = (socketId: string): Buffer => {
  const session = sessions.get(socketId);
  if (!session || session.audioChunks.length === 0) return Buffer.alloc(0);
  const audio = Buffer.concat(session.audioChunks);
  session.audioChunks = [];
  return audio;
};

// Append a recorded audio segment (a user utterance or an agent reply) in order.
export const appendSegment = (socketId: string, segment: AudioSegment): void => {
  const session = sessions.get(socketId);
  if (!session) return;
  session.segments.push(segment);
  if (segment.role === "user") session.userTurns += 1;
};

// Append a transcript line (the spoken text) for the saved conversation.
export const appendTranscript = (
  socketId: string,
  entry: TranscriptEntry,
): void => {
  const session = sessions.get(socketId);
  if (!session) return;
  session.transcript.push(entry);
};

export const endSession = (socketId: string): CallSession | undefined => {
  const session = sessions.get(socketId);
  sessions.delete(socketId);
  return session;
};
