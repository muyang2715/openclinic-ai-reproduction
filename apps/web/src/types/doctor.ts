export type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type Schedule = {
  id: string;
  doctorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  createdAt: string;
  updatedAt: string;
};

export type Doctor = {
  id: string;
  name: string;
  department: string;
  speciality: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  schedules?: Schedule[];
};

export type CreateDoctorInput = {
  name: string;
  department: string;
  speciality: string;
  isActive: boolean;
};

export type UpdateDoctorInput = Partial<CreateDoctorInput>;

export type DoctorsPage = {
  items: Doctor[];
  total: number;
  page: number;
  limit: number;
};

export type ListDoctorsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive";
};
