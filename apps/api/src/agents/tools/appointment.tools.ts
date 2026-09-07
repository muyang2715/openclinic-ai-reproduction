import { tool } from "@langchain/core/tools";
import { z } from "zod/v4";

import { Prisma } from "../../generated/prisma/client";
import { AppointmentStatus } from "../../generated/prisma/enums";
import * as appointmentsData from "../../data/appointments.data";
import * as doctorsData from "../../data/doctors.data";
import { DEFAULT_APPOINTMENT_MINUTES } from "../../config/agents";
import { sendAppointmentConfirmation } from "../../libs/mailer";

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

// Context bound from the call/graph state — the caller's name/email come from the
// pre-call form, so they're trusted here rather than left to the LLM to carry.
export type BookAppointmentContext = {
  patientName?: string;
  patientEmail?: string;
  patientMessages?: string[];
};

const hasExplicitBookingRequest = (messages: string[]) =>
  messages.some((message) =>
    /\b(book|schedule|reserve|confirm|make|set up)\b|\u9884\u7ea6|\u6302\u53f7|\u5e2e\u6211\u7ea6|\u786e\u8ba4/i.test(
      message,
    ),
  );

const hasPatientSuppliedDate = (messages: string[]) =>
  messages.some((message) =>
    /\b20\d{2}[-/]\d{1,2}[-/]\d{1,2}\b|\b(today|tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2})\b|\u4eca天|\u660e天|\u540e天|\u4e0b周|\d{1,2}\u6708\d{1,2}\u65e5/i.test(
      message,
    ),
  );

const hasPatientSuppliedTime = (messages: string[]) =>
  messages.some((message) =>
    /\b(?:[01]?\d|2[0-3]):[0-5]\d\b|\b\d{1,2}(?::[0-5]\d)?\s*(?:a\.?m\.?|p\.?m\.?)\b|(?:\u4e0a午|\u4e0b午|\u665a上|\u4e2d午)?\s*\d{1,2}\s*(?:点|时)(?:\u534a|\d{1,2}\u5206)?/i.test(
      message,
    ),
  );

// Factory: builds the book_appointment tool for one conversation, closing over the
// caller's form-provided name/email. Rebuilt per invocation in appointment.node.
export const makeBookAppointmentTool = (ctx: BookAppointmentContext = {}) =>
  tool(
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
      patientName?: string;
      startTimeISO: string;
      durationMinutes?: number;
      reason?: string;
    }) => {
      // Prefer the form name; fall back to whatever the model supplied.
      const finalName = ctx.patientName ?? patientName;
      if (!finalName) return "I still need the patient's name to book.";

      const patientMessages = ctx.patientMessages ?? [];
      if (!hasExplicitBookingRequest(patientMessages)) {
        return "Do not book yet. The patient has not explicitly asked to create or confirm an appointment.";
      }
      if (
        !hasPatientSuppliedDate(patientMessages) ||
        !hasPatientSuppliedTime(patientMessages)
      ) {
        return "Do not book yet. Ask the patient for a specific date and time; never invent either value.";
      }

      // Resolve the doctor by id, else by a name/speciality search.
      let resolvedId = doctorId;
      let doctorName = "";
      let doctorSpeciality = "";
      if (resolvedId) {
        const doctor = await doctorsData.findDoctorById(resolvedId);
        if (!doctor) return `No doctor found with id ${resolvedId}.`;
        doctorName = doctor.name;
        doctorSpeciality = doctor.speciality;
      } else {
        if (!doctorQuery)
          return "Provide a doctor name/speciality or a doctorId.";
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
          const list = all.map((d) => `${d.name} (${d.speciality})`).join(", ");
          return `No active doctor matches "${doctorQuery}". Available doctors: ${list}. Retry with one of these.`;
        }
        resolvedId = first.id;
        doctorName = first.name;
        doctorSpeciality = first.speciality;
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
        patientName: finalName,
        startTime: start,
        endTime: end,
        status: AppointmentStatus.BOOKED,
        ...(ctx.patientEmail ? { patientEmail: ctx.patientEmail } : {}),
        ...(reason ? { reason } : {}),
      });

      // Fire the confirmation email (guarded/no-throw). A failure here must not
      // fail the booking, which is already persisted.
      if (ctx.patientEmail) {
        await sendAppointmentConfirmation({
          to: ctx.patientEmail,
          patientName: finalName,
          doctorName,
          ...(doctorSpeciality ? { speciality: doctorSpeciality } : {}),
          startTime: start,
          endTime: end,
          durationMinutes: minutes,
          ...(reason ? { reason } : {}),
        });
      }

      return `Booked appointment ${appointment.id} with ${doctorName} for ${finalName} starting ${start.toISOString()} (${minutes} min).`;
    },
    {
      name: "book_appointment",
      description:
        "Book an appointment. Requires an absolute startTimeISO date-time, plus either doctorId or doctorQuery (name/speciality). The patient's name is already known from the call.",
      schema: z.object({
        doctorId: z.string().optional(),
        doctorQuery: z
          .string()
          .optional()
          .describe("doctor name or speciality if doctorId is unknown"),
        patientName: z
          .string()
          .optional()
          .describe("only if the caller's name is not already known"),
        startTimeISO: z
          .string()
          .describe("absolute ISO 8601 date-time, e.g. 2026-07-02T15:00:00"),
        durationMinutes: z.number().optional(),
        reason: z.string().optional(),
      }),
    },
  );
