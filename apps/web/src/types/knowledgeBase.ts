export type DocFileType = "pdf" | "docx" | "txt" | "md";

export type DocumentStatus = "PROCESSING" | "READY" | "FAILED";

export type KbDocument = {
  id: string;
  fileName: string;
  fileType: DocFileType;
  fileSize: number;
  chunkCount: number;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
};

export type DocumentsPage = {
  items: KbDocument[];
  total: number;
  page: number;
  limit: number;
};

export type ListDocumentsParams = {
  page?: number;
  limit?: number;
  search?: string;
};
