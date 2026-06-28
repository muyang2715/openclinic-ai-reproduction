export type AppointmentStatus =
  | "BOOKED"
  | "CANCELLED"
  | "COMPLETED"
  | "RESCHEDULED";

export type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  status: AppointmentStatus;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    name: string;
    speciality: string;
  };
};

export type CreateAppointmentInput = {
  doctorId: string;
  patientName: string;
  startTime: string; // ISO
  endTime: string; // ISO
  status?: AppointmentStatus;
  reason?: string;
};

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export type AppointmentsPage = {
  items: Appointment[];
  total: number;
  page: number;
  limit: number;
};

export type ListAppointmentsParams = {
  page?: number;
  limit?: number;
  doctorId?: string;
  status?: AppointmentStatus;
  search?: string;
};
