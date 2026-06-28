import { api, type ApiEnvelope } from "@/lib/api";
import type {
  Appointment,
  AppointmentsPage,
  CreateAppointmentInput,
  ListAppointmentsParams,
  UpdateAppointmentInput,
} from "@/types/appointment";

export const getAppointments = (params: ListAppointmentsParams = {}) =>
  api
    .get<ApiEnvelope<AppointmentsPage>>("/appointments/getAppointments", {
      params,
    })
    .then((res) => res.data.data);

export const getAppointmentById = (id: string) =>
  api
    .get<ApiEnvelope<Appointment>>(`/appointments/getAppointmentById/${id}`)
    .then((res) => res.data.data);

export const createAppointment = (input: CreateAppointmentInput) =>
  api
    .post<ApiEnvelope<Appointment>>("/appointments/createAppointment", input)
    .then((res) => res.data.data);

export const updateAppointment = (id: string, input: UpdateAppointmentInput) =>
  api
    .patch<ApiEnvelope<Appointment>>(
      `/appointments/updateAppointment/${id}`,
      input,
    )
    .then((res) => res.data.data);

export const deleteAppointment = (id: string) =>
  api
    .delete<ApiEnvelope<null>>(`/appointments/deleteAppointment/${id}`)
    .then((res) => res.data.data);
