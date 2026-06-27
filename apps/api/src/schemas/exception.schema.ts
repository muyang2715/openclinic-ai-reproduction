import { z } from "zod";
import { ScheduleExceptionType } from "../generated/prisma/enums";

const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

const exceptionBaseSchema = z.object({
  doctorId: z.string().min(1),
  date: z.coerce.date(),
  type: z.nativeEnum(ScheduleExceptionType),
  startTime: timeField.optional(),
  endTime: timeField.optional(),
  reason: z.string().optional(),
});

export const createExceptionSchema = exceptionBaseSchema.refine(
  (data) =>
    data.type !== ScheduleExceptionType.CUSTOM ||
    (!!data.startTime && !!data.endTime && data.endTime > data.startTime),
  {
    message: "CUSTOM exceptions require startTime and endTime (end after start)",
    path: ["startTime"],
  },
);

export const updateExceptionSchema = exceptionBaseSchema.partial();

export type CreateExceptionInput = z.infer<typeof createExceptionSchema>;
export type UpdateExceptionInput = z.infer<typeof updateExceptionSchema>;
