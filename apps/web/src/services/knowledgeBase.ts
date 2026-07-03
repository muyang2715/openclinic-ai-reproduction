import { api, type ApiEnvelope } from "@/lib/api";
import type {
  DocumentsPage,
  KbDocument,
  ListDocumentsParams,
} from "@/types/knowledgeBase";

export const getDocuments = (params: ListDocumentsParams = {}) =>
  api
    .get<ApiEnvelope<DocumentsPage>>("/knowledgeBase/getDocuments", { params })
    .then((res) => res.data.data);

export const uploadDocument = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api
    .post<ApiEnvelope<KbDocument>>(
      "/knowledgeBase/uploadDocument",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    .then((res) => res.data.data);
};

export const deleteDocument = (id: string) =>
  api
    .delete<ApiEnvelope<null>>(`/knowledgeBase/deleteDocument/${id}`)
    .then((res) => res.data.data);
