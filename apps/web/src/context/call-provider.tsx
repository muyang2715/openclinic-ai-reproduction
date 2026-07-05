"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import { SocketEvent } from "@repo/shared";
import { createCallSocket, type CallSocket } from "@/lib/socket";
import {
  createLevelMeter,
  createUtteranceRecorder,
  requestMic,
  stopStream,
  type UtteranceRecorder,
} from "@/lib/audio";

export type CallStatus = "idle" | "connecting" | "live";

export type Caption = { id: number; role: "user" | "agent"; text: string };

/** Caller details collected by the pre-call form. */
export type CallerDetails = { name: string; email: string };

export type CallContextValue = {
  status: CallStatus;
  isOpen: boolean;
  formOpen: boolean;
  userSpeaking: boolean;
  agentSpeaking: boolean;
  processing: boolean;
  micLevel: number;
  muted: boolean;
  error: string | null;
  transcript: Caption[];
  openForm: () => void;
  closeForm: () => void;
  startCall: (patient: CallerDetails) => void;
  endCall: () => void;
  toggleMute: () => void;
};

export const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [formOpen, setFormOpen] = useState(false);
  const [userSpeaking, setUserSpeaking] = useState(false);
  const [agentSpeaking, setAgentSpeaking] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Caption[]>([]);

  const socketRef = useRef<CallSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<UtteranceRecorder | null>(null);
  const meterCleanupRef = useRef<(() => void) | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const playingRef = useRef(false);
  const mutedRef = useRef(false);
  const agentSpeakingRef = useRef(false);
  const captionId = useRef(0);

  const addCaption = useCallback((role: "user" | "agent", text: string) => {
    captionId.current += 1;
    setTranscript((prev) => [
      ...prev.slice(-8),
      { id: captionId.current, role, text },
    ]);
  }, []);

  const teardown = useCallback(() => {
    meterCleanupRef.current?.();
    meterCleanupRef.current = null;
    recorderRef.current = null;

    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.src = "";
      audioElRef.current = null;
    }
    audioQueueRef.current.forEach((url) => URL.revokeObjectURL(url));
    audioQueueRef.current = [];
    playingRef.current = false;
    agentSpeakingRef.current = false;

    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const endCall = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(SocketEvent.CallEnd);
    }
    teardown();
    setStatus("idle");
    setUserSpeaking(false);
    setAgentSpeaking(false);
    setProcessing(false);
    setMicLevel(0);
    setMuted(false);
    setTranscript([]);
    mutedRef.current = false;
  }, [teardown]);

  const playNext = useCallback(() => {
    if (playingRef.current) return;
    const url = audioQueueRef.current.shift();
    const audio = audioElRef.current;
    if (!url || !audio) {
      setAgentSpeaking(false);
      agentSpeakingRef.current = false;
      return;
    }
    playingRef.current = true;
    setProcessing(false);
    setAgentSpeaking(true);
    agentSpeakingRef.current = true;
    audio.src = url;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      playingRef.current = false;
      if (audioQueueRef.current.length === 0) {
        setAgentSpeaking(false);
        agentSpeakingRef.current = false;
      }
      playNext();
    };
    audio.play().catch(() => {
      URL.revokeObjectURL(url);
      playingRef.current = false;
      playNext();
    });
  }, []);

  const enqueueAudio = useCallback(
    (buffer: ArrayBuffer) => {
      const url = URL.createObjectURL(
        new Blob([buffer], { type: "audio/mpeg" }),
      );
      audioQueueRef.current.push(url);
      playNext();
    },
    [playNext],
  );

  const beginStreaming = useCallback(
    (socket: CallSocket, stream: MediaStream) => {
      const recorder = createUtteranceRecorder(stream);
      recorderRef.current = recorder;

      meterCleanupRef.current = createLevelMeter(stream, {
        onLevel: setMicLevel,
        onSpeakingChange: (speaking) => {
          setUserSpeaking(speaking && !mutedRef.current);
          // Start capturing a fresh utterance, unless muted or the agent is talking.
          if (
            speaking &&
            !mutedRef.current &&
            !agentSpeakingRef.current &&
            !recorder.isRecording()
          ) {
            recorder.start();
          }
        },
        onTurnEnd: () => {
          if (!recorder.isRecording()) return;
          void recorder.stop().then((buffer) => {
            if (buffer && socket.connected && !mutedRef.current) {
              socket.emit(SocketEvent.AudioChunk, buffer);
              socket.emit(SocketEvent.UserTurnEnd);
              setProcessing(true);
            }
          });
        },
      });
    },
    [],
  );

  const openForm = useCallback(() => {
    if (status !== "idle") return;
    setError(null);
    setFormOpen(true);
  }, [status]);

  const closeForm = useCallback(() => setFormOpen(false), []);

  const startCall = useCallback(
    async (patient: CallerDetails) => {
      if (status !== "idle") return;
      setFormOpen(false);
      setStatus("connecting");
      setError(null);
      setTranscript([]);

      let stream: MediaStream;
      try {
        stream = await requestMic();
      } catch {
        setError("Microphone access is required to start a call.");
        toast.error("Microphone access is required to start a call.");
        setStatus("idle");
        return;
      }
      streamRef.current = stream;
      audioElRef.current = new Audio();

      const socket = createCallSocket();
      socketRef.current = socket;

      socket.on(SocketEvent.CallReady, () => {
        setStatus("live");
        beginStreaming(socket, stream);
      });
      socket.on(SocketEvent.TranscriptFinal, ({ text }) => {
        addCaption("user", text);
      });
      socket.on(SocketEvent.AgentResponse, ({ text }) => {
        addCaption("agent", text);
      });
      socket.on(SocketEvent.TtsAudio, (audio) => {
        enqueueAudio(audio);
      });
      socket.on(SocketEvent.CallError, ({ message }) => {
        // A failed turn should NOT end the call — just surface it.
        setProcessing(false);
        toast.error(message);
      });
      socket.on("connect", () => {
        socket.emit(SocketEvent.CallStart, {
          patientName: patient.name,
          email: patient.email,
        });
      });
      socket.on("connect_error", () => {
        setError("Couldn't connect to the call server.");
        toast.error("Couldn't connect to the call server.");
        endCall();
      });

      socket.connect();
    },
    [status, beginStreaming, addCaption, enqueueAudio, endCall],
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => () => teardown(), [teardown]);

  const value = useMemo<CallContextValue>(
    () => ({
      status,
      isOpen: status !== "idle",
      formOpen,
      userSpeaking,
      agentSpeaking,
      processing,
      micLevel,
      muted,
      error,
      transcript,
      openForm,
      closeForm,
      startCall,
      endCall,
      toggleMute,
    }),
    [
      status,
      formOpen,
      userSpeaking,
      agentSpeaking,
      processing,
      micLevel,
      muted,
      error,
      transcript,
      openForm,
      closeForm,
      startCall,
      endCall,
      toggleMute,
    ],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}
