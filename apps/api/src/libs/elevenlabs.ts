import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

import { ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID } from "../config/config";
import { TTS_MODEL, TTS_OUTPUT_FORMAT } from "../config/voice";

const elevenlabs = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

const collectStream = async (
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> => {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
};

// Synthesizes speech for the agent's reply. Returns mp3 bytes.
export const synthesizeSpeech = async (text: string): Promise<Buffer> => {
  const stream = await elevenlabs.textToSpeech.convert(ELEVENLABS_VOICE_ID, {
    text,
    modelId: TTS_MODEL,
    outputFormat: TTS_OUTPUT_FORMAT,
  });
  return collectStream(stream);
};
