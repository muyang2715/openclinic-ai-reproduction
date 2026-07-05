// Voice-pipeline constants (Rule #1 — no magic values).

export const DEEPGRAM_MODEL = "nova-2";
export const STT_MIMETYPE = "audio/webm";

export const TTS_MODEL = "eleven_turbo_v2_5";
export const TTS_OUTPUT_FORMAT = "mp3_44100_128";

const GREETING_BODY =
  "Thanks for calling OpenClinic AI. I can answer questions about the clinic, book an appointment, or help with an urgent concern. How can I help you today?";

// Anonymous fallback greeting (no caller name available).
export const GREETING = `Hi! ${GREETING_BODY}`;

// The caller's first name only, for a natural spoken greeting.
const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? name;

// Personalized greeting when the pre-call form gave us a name.
export const greetingFor = (name?: string): string =>
  name && name.trim() ? `Hi ${firstName(name)}! ${GREETING_BODY}` : GREETING;
