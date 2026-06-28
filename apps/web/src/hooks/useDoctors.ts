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
  createDoctor,
  deleteDoctor,
  getDoctorById,
  getDoctors,
  updateDoctor,
} from "@/services/doctors";
import type {
  ListDoctorsParams,
  UpdateDoctorInput,
} from "@/types/doctor";

const doctorsKey = ["doctors"] as const;

export function useDoctors(params: ListDoctorsParams) {
  return useQuery({
    queryKey: [...doctorsKey, params],
    queryFn: () => getDoctors(params),
    placeholderData: keepPreviousData,
  });
}

export function useDoctor(id: string) {
  return useQuery({
    queryKey: [...doctorsKey, id],
    queryFn: () => getDoctorById(id),
    enabled: Boolean(id),
  });
}

export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDoctor,
    onSuccess: (doctor) => {
      qc.invalidateQueries({ queryKey: doctorsKey });
      toast.success(`${doctor.name} has been added.`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDoctorInput }) =>
      updateDoctor(id, input),
    onSuccess: (doctor) => {
      qc.invalidateQueries({ queryKey: doctorsKey });
      toast.success(`${doctor.name} has been updated.`);
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDoctor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: doctorsKey });
      toast.success("Doctor has been removed.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
