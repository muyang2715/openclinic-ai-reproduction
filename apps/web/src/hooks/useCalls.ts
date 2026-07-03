"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getCallById, getCalls } from "@/services/calls";
import type { ListCallsParams } from "@/types/call";

const callsKey = ["calls"] as const;

export function useCallsList(params: ListCallsParams) {
  return useQuery({
    queryKey: [...callsKey, params],
    queryFn: () => getCalls(params),
    placeholderData: keepPreviousData,
  });
}

export function useCallDetail(id: string | null) {
  return useQuery({
    queryKey: [...callsKey, "detail", id],
    queryFn: () => getCallById(id as string),
    enabled: id !== null,
  });
}
