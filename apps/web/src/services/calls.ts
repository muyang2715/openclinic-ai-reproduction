import { api, type ApiEnvelope } from "@/lib/api";
import type {
  CallDetail,
  CallsPage,
  ListCallsParams,
} from "@/types/call";

export const getCalls = (params: ListCallsParams = {}) =>
  api
    .get<ApiEnvelope<CallsPage>>("/calls/getCalls", { params })
    .then((res) => res.data.data);

export const getCallById = (id: string) =>
  api
    .get<ApiEnvelope<CallDetail>>(`/calls/getCallById/${id}`)
    .then((res) => res.data.data);
