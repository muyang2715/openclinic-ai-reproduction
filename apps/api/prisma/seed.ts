import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";
import {
  AppointmentStatus,
  DayOfWeek,
} from "../src/generated/prisma/enums";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set before seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const weekdays = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
];

const doctors = [
  {
    id: "doctor-amelia-carter",
    name: "Amelia Carter",
    department: "Heart & Vascular",
    speciality: "Cardiology",
  },
  {
    id: "doctor-noah-bennett",
    name: "Noah Bennett",
    department: "Skin Health",
    speciality: "Dermatology",
  },
  {
    id: "doctor-sophia-nguyen",
    name: "Sophia Nguyen",
    department: "Primary Care",
    speciality: "General Medicine",
  },
  {
    id: "doctor-ethan-williams",
    name: "Ethan Williams",
    department: "Children's Health",
    speciality: "Pediatrics",
  },
  {
    id: "doctor-olivia-martinez",
    name: "Olivia Martinez",
    department: "Neurosciences",
    speciality: "Neurology",
  },
];

const atLocalTime = (daysFromToday: number, hour: number, minute = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + daysFromToday);
  value.setHours(hour, minute, 0, 0);
  return value;
};

async function main() {
  for (const doctor of doctors) {
    await prisma.doctor.upsert({
      where: { id: doctor.id },
      update: { ...doctor, isActive: true },
      create: { ...doctor, isActive: true },
    });

    await prisma.doctorSchedule.deleteMany({
      where: { doctorId: doctor.id },
    });
    await prisma.doctorSchedule.createMany({
      data: weekdays.map((dayOfWeek) => ({
        doctorId: doctor.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
      })),
    });
  }

  const appointments = [
    {
      id: "appointment-demo-today",
      doctorId: doctors[0]!.id,
      patientName: "Emma Thompson",
      patientEmail: "emma@example.com",
      startTime: atLocalTime(0, 10),
      endTime: atLocalTime(0, 10, 30),
      status: AppointmentStatus.BOOKED,
      reason: "Cardiology follow-up",
    },
    {
      id: "appointment-demo-tomorrow",
      doctorId: doctors[1]!.id,
      patientName: "James Wilson",
      patientEmail: "james@example.com",
      startTime: atLocalTime(1, 14),
      endTime: atLocalTime(1, 14, 30),
      status: AppointmentStatus.BOOKED,
      reason: "Persistent skin irritation",
    },
    {
      id: "appointment-demo-upcoming",
      doctorId: doctors[2]!.id,
      patientName: "Ava Patel",
      patientEmail: "ava@example.com",
      startTime: atLocalTime(2, 11),
      endTime: atLocalTime(2, 11, 30),
      status: AppointmentStatus.BOOKED,
      reason: "Annual physical",
    },
    {
      id: "appointment-demo-completed",
      doctorId: doctors[3]!.id,
      patientName: "Liam Chen",
      patientEmail: "liam@example.com",
      startTime: atLocalTime(-2, 9),
      endTime: atLocalTime(-2, 9, 30),
      status: AppointmentStatus.COMPLETED,
      reason: "Pediatric check-up",
    },
  ];

  for (const appointment of appointments) {
    await prisma.appointment.upsert({
      where: { id: appointment.id },
      update: appointment,
      create: appointment,
    });
  }

  const [doctorCount, scheduleCount, appointmentCount] = await Promise.all([
    prisma.doctor.count(),
    prisma.doctorSchedule.count(),
    prisma.appointment.count(),
  ]);

  console.log(
    `Seeded ${doctorCount} doctors, ${scheduleCount} schedules, and ${appointmentCount} appointments.`,
  );
}

main()
  .finally(async () => prisma.$disconnect())
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
