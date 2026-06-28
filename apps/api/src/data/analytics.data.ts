import { prisma } from "../libs/prisma";

export const countTotalDoctors = () => prisma.doctor.count();

export const countActiveDoctors = () =>
  prisma.doctor.count({ where: { isActive: true } });

export const countTotalAppointments = () => prisma.appointment.count();

export const countAppointmentsBetween = (start: Date, end: Date) =>
  prisma.appointment.count({
    where: { startTime: { gte: start, lt: end } },
  });

export const countUpcomingAppointments = (from: Date) =>
  prisma.appointment.count({ where: { startTime: { gte: from } } });

export const groupAppointmentsByStatus = () =>
  prisma.appointment.groupBy({ by: ["status"], _count: true });

export const countDistinctPatients = async () => {
  const rows = await prisma.appointment.findMany({
    distinct: ["patientName"],
    select: { patientName: true },
  });
  return rows.length;
};

export const findRecentAppointments = (take: number) =>
  prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { doctor: { select: { id: true, name: true, speciality: true } } },
  });

export const findLatestDoctors = (take: number) =>
  prisma.doctor.findMany({ orderBy: { createdAt: "desc" }, take });

export const findAppointmentTimesSince = (since: Date) =>
  prisma.appointment.findMany({
    where: { startTime: { gte: since } },
    select: { startTime: true, endTime: true },
  });

export const findAllAppointmentTimes = () =>
  prisma.appointment.findMany({ select: { startTime: true, endTime: true } });
