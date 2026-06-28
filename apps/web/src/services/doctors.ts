import { api, type ApiEnvelope } from "@/lib/api";
import type {
  CreateDoctorInput,
  Doctor,
  DoctorsPage,
  ListDoctorsParams,
  UpdateDoctorInput,
} from "@/types/doctor";

export const getDoctors = (params: ListDoctorsParams = {}) =>
  api
    .get<ApiEnvelope<DoctorsPage>>("/doctors/getDoctors", { params })
    .then((res) => res.data.data);

export const getDoctorById = (id: string) =>
  api
    .get<ApiEnvelope<Doctor>>(`/doctors/getDoctorById/${id}`)
    .then((res) => res.data.data);

export const createDoctor = (input: CreateDoctorInput) =>
  api
    .post<ApiEnvelope<Doctor>>("/doctors/createDoctor", input)
    .then((res) => res.data.data);

export const updateDoctor = (id: string, input: UpdateDoctorInput) =>
  api
    .patch<ApiEnvelope<Doctor>>(`/doctors/updateDoctor/${id}`, input)
    .then((res) => res.data.data);

export const deleteDoctor = (id: string) =>
  api
    .delete<ApiEnvelope<null>>(`/doctors/deleteDoctor/${id}`)
    .then((res) => res.data.data);
