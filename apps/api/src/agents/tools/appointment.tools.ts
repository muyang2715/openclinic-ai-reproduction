import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";

import { Prisma } from "../../generated/prisma/client";
import { AppointmentStatus } from "../../generated/prisma/enums";
import * as appointmentsData from "../../data/appointments.data";
import * as doctorsData from "../../data/doctors.data";
import { DEFAULT_APPOINTMENT_MINUTES } from "../../config/agents";

const doctorSearchWhere = (query: string): Prisma.DoctorWhereInput => ({
  isActive: true,
  OR: [
    { name: { contains: query, mode: "insensitive" } },
    { speciality: { contains: query, mode: "insensitive" } },
    { department: { contains: query, mode: "insensitive" } },
  ],
});

export const listDoctorsTool = tool(
  async ({ query }: { query?: string }) => {
    const where: Prisma.DoctorWhereInput = query
      ? doctorSearchWhere(query)
      : { isActive: true };
    const doctors = await doctorsData.findDoctors({ skip: 0, take: 10, where });
    if (doctors.length === 0) return "No matching doctors found.";
    return doctors
      .map((d) => `${d.id} | ${d.name} | ${d.speciality} | ${d.department}`)
      .join("\n");
  },
  {
    name: "list_doctors",
    description:
      "Search active doctors by name, speciality, or department. Returns lines of: id | name | speciality | department.",
    schema: z.object({
      query: z
        .string()
        .optional()
        .describe("name or speciality to search; omit to list doctors"),
    }),
  },
);

export const bookAppointmentTool = tool(
  async ({
    doctorId,
    doctorQuery,
    patientName,
    startTimeISO,
    durationMinutes,
    reason,
  }: {
    doctorId?: string;
    doctorQuery?: string;
    patientName: string;
    startTimeISO: string;
    durationMinutes?: number;
    reason?: string;
  }) => {
    // Resolve the doctor by id, else by a name/speciality search.
    let resolvedId = doctorId;
    let doctorName = "";
    if (resolvedId) {
      const doctor = await doctorsData.findDoctorById(resolvedId);
      if (!doctor) return `No doctor found with id ${resolvedId}.`;
      doctorName = doctor.name;
    } else {
      if (!doctorQuery) return "Provide a doctor name/speciality or a doctorId.";
      const matches = await doctorsData.findDoctors({
        skip: 0,
        take: 1,
        where: doctorSearchWhere(doctorQuery),
      });
      const first = matches[0];
      if (!first) {
        const all = await doctorsData.findDoctors({
          skip: 0,
          take: 10,
          where: { isActive: true },
        });
        const list = all
          .map((d) => `${d.name} (${d.speciality})`)
          .join(", ");
        return `No active doctor matches "${doctorQuery}". Available doctors: ${list}. Retry with one of these.`;
      }
      resolvedId = first.id;
      doctorName = first.name;
    }

    const start = new Date(startTimeISO);
    if (Number.isNaN(start.getTime())) {
      return "startTimeISO is not a valid date-time.";
    }
    const minutes = durationMinutes ?? DEFAULT_APPOINTMENT_MINUTES;
    const end = new Date(start.getTime() + minutes * 60_000);

    // Light overlap check against existing booked appointments.
    const clash = await appointmentsData.findAppointments({
      skip: 0,
      take: 1,
      where: {
        doctorId: resolvedId,
        status: AppointmentStatus.BOOKED,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });
    if (clash.length > 0) {
      return `Dr. ${doctorName} already has an appointment overlapping that time. Please suggest another slot.`;
    }

    const appointment = await appointmentsData.createAppointment({
      doctorId: resolvedId,
      patientName,
      startTime: start,
      endTime: end,
      status: AppointmentStatus.BOOKED,
      ...(reason ? { reason } : {}),
    });

    return `Booked appointment ${appointment.id} with ${doctorName} for ${patientName} starting ${start.toISOString()} (${minutes} min).`;
  },
  {
    name: "book_appointment",
    description:
      "Book an appointment. Requires patientName and an absolute startTimeISO date-time, plus either doctorId or doctorQuery (name/speciality).",
    schema: z.object({
      doctorId: z.string().optional(),
      doctorQuery: z
        .string()
        .optional()
        .describe("doctor name or speciality if doctorId is unknown"),
      patientName: z.string(),
      startTimeISO: z
        .string()
        .describe("absolute ISO 8601 date-time, e.g. 2026-07-02T15:00:00"),
      durationMinutes: z.number().optional(),
      reason: z.string().optional(),
    }),
  },
);
