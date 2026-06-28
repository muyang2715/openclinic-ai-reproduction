import type { DayOfWeek } from "./doctor";

export type CreateScheduleInput = {
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
};

export type UpdateScheduleInput = Omit<CreateScheduleInput, "doctorId">;
