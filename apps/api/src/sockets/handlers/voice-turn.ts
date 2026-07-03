import type { Socket } from "socket.io";
import {
  SocketEvent,
  type ClientToServerEvents,
  type ServerToClientEvents,
} from "@repo/shared";

import { runAgent } from "../../agents";
import { transcribeAudio } from "../../libs/deepgram";
import { synthesizeSpeech } from "../../libs/elevenlabs";
import { GREETING } from "../../config/voice";
import {
  appendSegment,
  appendTranscript,
  drainAudio,
  getSession,
} from "../session";

type CallSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Speaks a piece of agent text: emit the caption + speaking flag + the audio.
const speak = async (
  socket: CallSocket,
  text: string,
  route: string | null,
): Promise<void> => {
  const session = getSession(socket.id);
  if (session) session.agentSpeaking = true;

  socket.emit(SocketEvent.AgentResponse, { text, route });
  socket.emit(SocketEvent.AgentSpeakingStart);

  const audio = await synthesizeSpeech(text);
  // Record the agent's side of the conversation for the saved call.
  appendTranscript(socket.id, { role: "agent", text, at: Date.now() });
  appendSegment(socket.id, {
    role: "agent",
    audio,
    format: "mp3",
    at: Date.now(),
  });
  // Socket.io sends Buffers as binary; the browser receives an ArrayBuffer.
  socket.emit(SocketEvent.TtsAudio, audio.buffer.slice(
    audio.byteOffset,
    audio.byteOffset + audio.byteLength,
  ) as ArrayBuffer);

  socket.emit(SocketEvent.AgentSpeakingStop);
  if (session) session.agentSpeaking = false;
};

// The agent greets the caller as soon as the call connects.
export const sendGreeting = async (socket: CallSocket): Promise<void> => {
  try {
    await speak(socket, GREETING, null);
  } catch (error) {
    console.error("[voice] greeting failed", error);
  }
};

// One real turn: STT -> agent -> TTS. A failed turn must never drop the call.
export const runVoiceTurn = async (socket: CallSocket): Promise<void> => {
  const session = getSession(socket.id);
  if (!session) return;

  try {
    const audio = drainAudio(socket.id);
    if (audio.byteLength === 0) return;

    const transcript = await transcribeAudio(audio);
    if (!transcript) return; // nothing intelligible — wait for the next turn

    // Record the caller's side (the drained buffer is a complete WebM utterance).
    appendTranscript(socket.id, { role: "user", text: transcript, at: Date.now() });
    appendSegment(socket.id, {
      role: "user",
      audio,
      format: "webm",
      at: Date.now(),
    });

    socket.emit(SocketEvent.TranscriptFinal, { text: transcript });

    const { reply, route } = await runAgent({
      sessionId: session.callId,
      message: transcript,
    });

    await speak(socket, reply, route);
  } catch (error) {
    console.error("[voice] turn failed", error);
    socket.emit(SocketEvent.CallError, {
      message: "Sorry, I had trouble with that. Could you say it again?",
    });
    const current = getSession(socket.id);
    if (current) current.agentSpeaking = false;
  }
};
