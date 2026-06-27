import { z } from "zod";
import { DayOfWeek } from "../generated/prisma/enums";

const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

const scheduleBaseSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: timeField,
  endTime: timeField,
});

const endAfterStart = (data: { startTime: string; endTime: string }) =>
  data.endTime > data.startTime;

const endAfterStartError = {
  message: "endTime must be after startTime",
  path: ["endTime"],
};

export const scheduleInputSchema = scheduleBaseSchema.refine(
  endAfterStart,
  endAfterStartError,
);

export const createScheduleSchema = scheduleBaseSchema
  .extend({ doctorId: z.string().min(1) })
  .refine(endAfterStart, endAfterStartError);

export const updateScheduleSchema = scheduleBaseSchema.partial();

export type ScheduleInput = z.infer<typeof scheduleInputSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;
