export type CallStatus = "COMPLETED" | "NO_AUDIO" | "FAILED";

export type CallRole = "user" | "agent";

export type TranscriptEntry = {
  role: CallRole;
  text: string;
  at: number;
};

export type CallSummary = {
  id: string;
  callId: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  patientName: string | null;
  userTurns: number;
  status: CallStatus;
  audioKey: string | null;
  createdAt: string;
};

export type CallDetail = CallSummary & {
  transcript: TranscriptEntry[];
  audioUrl: string | null;
};

export type CallsPage = {
  items: CallSummary[];
  total: number;
  page: number;
  limit: number;
};

export type ListCallsParams = {
  page?: number;
  limit?: number;
  search?: string;
};
