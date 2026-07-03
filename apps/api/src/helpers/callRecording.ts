import type { Prisma } from "../generated/prisma/client";
import type { CallSession } from "../sockets/session";
import { mergeSegmentsToMp3 } from "../libs/audioMerge";
import { uploadCallRecording } from "../libs/s3";
import * as callsData from "../data/calls.data";

const CallStatus = {
  Completed: "COMPLETED",
  NoAudio: "NO_AUDIO",
  Failed: "FAILED",
} as const;

// Persist a finished call: merge the recorded segments into one MP3, upload it to
// S3, and save the transcript + metadata to the DB. Runs after the call ends and
// is fully guarded — a merge/S3/DB failure must never disrupt socket teardown.
export const finalizeCall = async (session: CallSession): Promise<void> => {
  // Nothing worth saving if the caller never actually spoke.
  if (session.userTurns === 0) return;

  const endedAt = Date.now();
  const transcript = session.transcript as unknown as Prisma.InputJsonValue;

  let audioKey: string | null = null;
  let status: string = CallStatus.Completed;

  try {
    const mp3 = await mergeSegmentsToMp3(session.segments);
    audioKey = await uploadCallRecording(session.callId, mp3);
    // No bucket configured → transcript saved, but no recording stored.
    if (!audioKey) status = CallStatus.NoAudio;
  } catch (error) {
    console.error(`[call] recording failed for ${session.callId}`, error);
    status = CallStatus.Failed;
  }

  try {
    await callsData.createCall({
      callId: session.callId,
      startedAt: new Date(session.startedAt),
      endedAt: new Date(endedAt),
      durationSec: Math.round((endedAt - session.startedAt) / 1000),
      userTurns: session.userTurns,
      transcript,
      audioKey,
      status,
    });
    console.log(`[call] saved ${session.callId} (status ${status})`);
  } catch (error) {
    console.error(`[call] persist failed for ${session.callId}`, error);
  }
};
