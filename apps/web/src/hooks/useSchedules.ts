"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api";
import {
  createSchedule,
  deleteSchedule,
  getSchedules,
  updateSchedule,
} from "@/services/schedules";
import type { UpdateScheduleInput } from "@/types/schedule";

export function useSchedules(doctorId: string) {
  return useQuery({
    queryKey: ["schedules", doctorId],
    queryFn: () => getSchedules(doctorId),
    enabled: Boolean(doctorId),
  });
}

function useInvalidateSchedules(doctorId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["schedules", doctorId] });
    qc.invalidateQueries({ queryKey: ["doctors", doctorId] });
  };
}

export function useCreateSchedule(doctorId: string) {
  const invalidate = useInvalidateSchedules(doctorId);
  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      invalidate();
      toast.success("Working hours added.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useUpdateSchedule(doctorId: string) {
  const invalidate = useInvalidateSchedules(doctorId);
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateScheduleInput }) =>
      updateSchedule(id, input),
    onSuccess: () => {
      invalidate();
      toast.success("Working hours updated.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteSchedule(doctorId: string) {
  const invalidate = useInvalidateSchedules(doctorId);
  return useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: () => {
      invalidate();
      toast.success("Working hours removed.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
