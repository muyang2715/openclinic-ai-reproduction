import { DeepgramClient } from "@deepgram/sdk";

import { DEEPGRAM_API_KEY } from "../config/config";
import { DEEPGRAM_MODEL } from "../config/voice";

const deepgram = new DeepgramClient({ apiKey: DEEPGRAM_API_KEY });

// Transcribes a complete utterance (webm/opus buffer) with Deepgram's
// prerecorded API. Returns the plain transcript ("" if nothing was heard).
export const transcribeAudio = async (audio: Buffer): Promise<string> => {
  const response = await deepgram.listen.v1.media.transcribeFile(audio, {
    model: DEEPGRAM_MODEL,
    smart_format: true,
    punctuate: true,
  });

  if (!("results" in response)) return "";
  const transcript =
    response.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  return transcript.trim();
};
