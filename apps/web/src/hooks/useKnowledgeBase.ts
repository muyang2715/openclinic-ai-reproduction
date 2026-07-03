"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import {
  deleteDocument,
  getDocuments,
  uploadDocument,
} from "@/services/knowledgeBase";
import type { ListDocumentsParams } from "@/types/knowledgeBase";

const documentsKey = ["documents"] as const;

export function useDocuments(params: ListDocumentsParams) {
  return useQuery({
    queryKey: [...documentsKey, params],
    queryFn: () => getDocuments(params),
    placeholderData: keepPreviousData,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: (document) => {
      qc.invalidateQueries({ queryKey: documentsKey });
      toast.success(`${document.fileName} has been added to the knowledge base.`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKey });
      toast.success("Document has been removed.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
