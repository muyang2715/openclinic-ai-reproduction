import "dotenv/config";

export const PORT = process.env.PORT;

export const WEB_ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

export const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? "";

export const PINECONE_INDEX = process.env.PINECONE_INDEX ?? "";

export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";

export const RESEND_FROM = process.env.RESEND_FROM ?? "onboarding@resend.dev";

export const EMERGENCY_EMAIL = process.env.EMERGENCY_EMAIL ?? "";

export const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY ?? "";

export const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY ?? "";

export const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ?? "EXAVITQu4vr4xnSDxMaL"; // Sarah (premade)

export const AWS_REGION = process.env.AWS_REGION ?? "";

export const AWS_S3_BUCKET =
  process.env.S3_BUCKET ?? process.env.AWS_S3_BUCKET ?? "";

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID ?? "";

export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY ?? "";
