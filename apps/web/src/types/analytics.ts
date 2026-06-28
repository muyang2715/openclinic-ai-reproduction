import type { Appointment, AppointmentStatus } from "./appointment";
import type { Doctor } from "./doctor";

export type StatusCount = { status: AppointmentStatus; count: number };
export type DayPoint = { day: string; appointments: number };
export type MonthPoint = { month: string; count: number };

export type DashboardStats = {
  totalDoctors: number;
  totalPatients: number;
  todaysAppointments: number;
  upcomingAppointments: number;
  weeklyAppointments: DayPoint[];
  appointmentsTrend: MonthPoint[];
  appointmentsByStatus: StatusCount[];
  recentAppointments: Appointment[];
  latestDoctors: Doctor[];
};

export type AnalyticsData = {
  totalAppointments: number;
  activeDoctors: number;
  totalDoctors: number;
  totalPatients: number;
  averageAppointmentMinutes: number;
  appointmentsByStatus: StatusCount[];
  appointmentsTrend: MonthPoint[];
  weeklyAppointments: DayPoint[];
};
