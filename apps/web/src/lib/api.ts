import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

/** Standard API envelope: { success, message, data }. */
type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type { ApiEnvelope };

/** Extract a human-readable message from an axios/API error. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  return fallback;
}
