// Centralized constants for the RAG knowledge base (Rule #1 — no magic values).

export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_DIMENSIONS = 1536;

export const CHUNK_SIZE = 1000;
export const CHUNK_OVERLAP = 200;

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export type DocFileType = "pdf" | "docx" | "txt" | "md";

// Accepted upload mime types → normalized file type stored on the Document row.
export const ALLOWED_DOC_MIME: Record<string, DocFileType> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
  "text/markdown": "md",
};

export const DocumentStatus = {
  Processing: "PROCESSING",
  Ready: "READY",
  Failed: "FAILED",
} as const;
