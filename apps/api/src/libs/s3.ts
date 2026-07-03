import { PutObjectCommand, S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  AWS_ACCESS_KEY_ID,
  AWS_REGION,
  AWS_S3_BUCKET,
  AWS_SECRET_ACCESS_KEY,
} from "../config/config";

const RECORDING_PREFIX = "calls";
const PRESIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

// S3 is optional infra: when the bucket/creds are unset, recording uploads
// no-op gracefully and the transcript is still saved to the DB.
const isConfigured = (): boolean =>
  Boolean(
    AWS_REGION && AWS_S3_BUCKET && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY,
  );

let client: S3Client | null = null;
const getClient = (): S3Client => {
  if (!client) {
    client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return client;
};

// Upload the combined call recording. Returns the S3 object key, or null when
// S3 is not configured (so the caller can still persist the transcript).
export const uploadCallRecording = async (
  callId: string,
  audio: Buffer,
): Promise<string | null> => {
  if (!isConfigured()) return null;

  const key = `${RECORDING_PREFIX}/${callId}.mp3`;
  await getClient().send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: key,
      Body: audio,
      ContentType: "audio/mpeg",
    }),
  );
  return key;
};

// Presign a temporary GET URL for playback. Returns null if S3 is unconfigured.
export const getRecordingUrl = async (
  key: string,
): Promise<string | null> => {
  if (!isConfigured()) return null;

  return getSignedUrl(
    getClient(),
    new GetObjectCommand({ Bucket: AWS_S3_BUCKET, Key: key }),
    { expiresIn: PRESIGNED_URL_TTL_SECONDS },
  );
};
