import type { Server, Socket } from "socket.io";
import {
  SocketEvent,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "@repo/shared";

import { appendAudio, createSession, endSession, getSession } from "./session";
import { runVoiceTurn, sendGreeting } from "./handlers/voice-turn";
import { finalizeCall } from "../helpers/callRecording";

type CallServer = Server<ClientToServerEvents, ServerToClientEvents>;
type CallSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Socket.io gateway — wiring only (coding-standards §4). Validates/loads the
// session and delegates the work; the STT -> agent -> TTS pipeline lives in
// handlers/voice-turn.
export const registerSocketHandlers = (io: CallServer): void => {
  io.on("connection", (socket: CallSocket) => {
    socket.on(SocketEvent.CallStart, () => {
      const session = createSession(socket.id);
      console.log(`[call] start ${session.callId} (socket ${socket.id})`);
      socket.emit(SocketEvent.CallReady, { callId: session.callId });
      // Agent greets first (spoken).
      void sendGreeting(socket);
    });

    socket.on(SocketEvent.AudioChunk, (chunk) => {
      const buffer = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk as ArrayBuffer);
      appendAudio(socket.id, buffer);
    });

    socket.on(SocketEvent.UserTurnEnd, () => {
      const session = getSession(socket.id);
      if (!session) return;
      console.log(
        `[call] user turn end ${session.callId} (${session.bytesReceived} bytes received)`,
      );
      void runVoiceTurn(socket);
    });

    const cleanup = (reason: string) => {
      // endSession deletes from the Map and returns the session, so this is
      // idempotent across call:end + disconnect — finalize runs exactly once.
      const session = endSession(socket.id);
      if (session) {
        const seconds = Math.round((Date.now() - session.startedAt) / 1000);
        console.log(
          `[call] end ${session.callId} (${reason}, ${seconds}s, ${session.bytesReceived} bytes)`,
        );
        // Persist the recording + transcript without blocking teardown.
        void finalizeCall(session);
      }
    };

    socket.on(SocketEvent.CallEnd, () => cleanup("call:end"));
    socket.on("disconnect", () => cleanup("disconnect"));
  });
};
