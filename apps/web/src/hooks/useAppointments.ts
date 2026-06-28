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
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  getAppointments,
  updateAppointment,
} from "@/services/appointments";
import type {
  ListAppointmentsParams,
  UpdateAppointmentInput,
} from "@/types/appointment";

const appointmentsKey = ["appointments"] as const;

export function useAppointments(params: ListAppointmentsParams) {
  return useQuery({
    queryKey: [...appointmentsKey, params],
    queryFn: () => getAppointments(params),
    placeholderData: keepPreviousData,
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: [...appointmentsKey, id],
    queryFn: () => getAppointmentById(id),
    enabled: Boolean(id),
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentsKey });
      toast.success("Appointment booked.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAppointmentInput }) =>
      updateAppointment(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentsKey });
      toast.success("Appointment updated.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: appointmentsKey });
      toast.success("Appointment deleted.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
