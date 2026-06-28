import { api, type ApiEnvelope } from "@/lib/api";
import type { Schedule } from "@/types/doctor";
import type {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "@/types/schedule";

export const getSchedules = (doctorId: string) =>
  api
    .get<ApiEnvelope<Schedule[]>>("/schedules/getSchedules", {
      params: { doctorId },
    })
    .then((res) => res.data.data);

export const createSchedule = (input: CreateScheduleInput) =>
  api
    .post<ApiEnvelope<Schedule>>("/schedules/createSchedule", input)
    .then((res) => res.data.data);

export const updateSchedule = (id: string, input: UpdateScheduleInput) =>
  api
    .patch<ApiEnvelope<Schedule>>(`/schedules/updateSchedule/${id}`, input)
    .then((res) => res.data.data);

export const deleteSchedule = (id: string) =>
  api
    .delete<ApiEnvelope<null>>(`/schedules/deleteSchedule/${id}`)
    .then((res) => res.data.data);
