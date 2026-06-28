import swaggerJSDoc from "swagger-jsdoc";
import { PORT } from "./config";

const idParam = {
  in: "path",
  name: "id",
  required: true,
  schema: { type: "string" },
};

const dayOfWeek = {
  type: "string",
  enum: [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ],
};

const time = { type: "string", example: "09:00" };

const appointmentStatus = {
  type: "string",
  enum: ["BOOKED", "CANCELLED", "COMPLETED", "RESCHEDULED"],
};

const exceptionType = { type: "string", enum: ["OFF", "CUSTOM"] };

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "open-clinic-ai API",
      version: "1.0.0",
    },
    servers: [{ url: `http://localhost:${PORT ?? 4000}` }],
    tags: [
      { name: "Doctors", description: "Doctor management endpoints" },
      { name: "Schedules", description: "Doctor weekly availability endpoints" },
      { name: "Appointments", description: "Patient appointment endpoints" },
      { name: "Exceptions", description: "Doctor availability exception endpoints" },
      { name: "Analytics", description: "Aggregated dashboard & analytics data" },
    ],
    components: {
      schemas: {
        Doctor: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            department: { type: "string" },
            speciality: { type: "string" },
            isActive: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateDoctorInput: {
          type: "object",
          required: ["name", "department", "speciality"],
          properties: {
            name: { type: "string" },
            department: { type: "string" },
            speciality: { type: "string" },
            isActive: { type: "boolean", default: true },
            schedules: {
              type: "array",
              items: { $ref: "#/components/schemas/ScheduleInput" },
            },
          },
        },
        UpdateDoctorInput: {
          type: "object",
          properties: {
            name: { type: "string" },
            department: { type: "string" },
            speciality: { type: "string" },
            isActive: { type: "boolean" },
          },
        },
        Schedule: {
          type: "object",
          properties: {
            id: { type: "string" },
            doctorId: { type: "string" },
            dayOfWeek,
            startTime: time,
            endTime: time,
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ScheduleInput: {
          type: "object",
          required: ["dayOfWeek", "startTime", "endTime"],
          properties: { dayOfWeek, startTime: time, endTime: time },
        },
        CreateScheduleInput: {
          type: "object",
          required: ["doctorId", "dayOfWeek", "startTime", "endTime"],
          properties: {
            doctorId: { type: "string" },
            dayOfWeek,
            startTime: time,
            endTime: time,
          },
        },
        UpdateScheduleInput: {
          type: "object",
          properties: { dayOfWeek, startTime: time, endTime: time },
        },
        Appointment: {
          type: "object",
          properties: {
            id: { type: "string" },
            doctorId: { type: "string" },
            patientName: { type: "string" },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" },
            status: appointmentStatus,
            reason: { type: "string", nullable: true },
            doctor: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                speciality: { type: "string" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateAppointmentInput: {
          type: "object",
          required: ["doctorId", "patientName", "startTime", "endTime"],
          properties: {
            doctorId: { type: "string" },
            patientName: { type: "string" },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" },
            status: appointmentStatus,
            reason: { type: "string" },
          },
        },
        UpdateAppointmentInput: {
          type: "object",
          properties: {
            patientName: { type: "string" },
            startTime: { type: "string", format: "date-time" },
            endTime: { type: "string", format: "date-time" },
            status: appointmentStatus,
            reason: { type: "string" },
          },
        },
        ScheduleException: {
          type: "object",
          properties: {
            id: { type: "string" },
            doctorId: { type: "string" },
            date: { type: "string", format: "date" },
            type: exceptionType,
            startTime: { ...time, nullable: true },
            endTime: { ...time, nullable: true },
            reason: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateExceptionInput: {
          type: "object",
          required: ["doctorId", "date", "type"],
          properties: {
            doctorId: { type: "string" },
            date: { type: "string", format: "date", example: "2026-07-01" },
            type: exceptionType,
            startTime: time,
            endTime: time,
            reason: { type: "string" },
          },
        },
        UpdateExceptionInput: {
          type: "object",
          properties: {
            date: { type: "string", format: "date" },
            type: exceptionType,
            startTime: time,
            endTime: time,
            reason: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/api/v1/doctors/createDoctor": {
        post: {
          tags: ["Doctors"],
          summary: "Create a doctor (optionally with schedules)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateDoctorInput" },
              },
            },
          },
          responses: {
            201: { description: "Doctor created successfully" },
            400: { description: "Validation failed" },
          },
        },
      },
      "/api/v1/doctors/getDoctors": {
        get: {
          tags: ["Doctors"],
          summary: "List doctors (paginated, searchable, filterable)",
          parameters: [
            {
              in: "query",
              name: "page",
              schema: { type: "integer", default: 1, minimum: 1 },
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
            },
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Matches name, speciality, or department",
            },
            {
              in: "query",
              name: "status",
              schema: { type: "string", enum: ["active", "inactive"] },
            },
          ],
          responses: {
            200: {
              description:
                "Paginated doctors: data = { items, total, page, limit }",
            },
          },
        },
      },
      "/api/v1/doctors/getDoctorById/{id}": {
        get: {
          tags: ["Doctors"],
          summary: "Get a doctor by id",
          parameters: [idParam],
          responses: {
            200: { description: "Doctor fetched successfully" },
            404: { description: "No such doctor" },
          },
        },
      },
      "/api/v1/doctors/updateDoctor/{id}": {
        patch: {
          tags: ["Doctors"],
          summary: "Update a doctor by id",
          parameters: [idParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateDoctorInput" },
              },
            },
          },
          responses: {
            200: { description: "Doctor updated successfully" },
            400: { description: "Validation failed" },
            404: { description: "Doctor not found" },
          },
        },
      },
      "/api/v1/doctors/deleteDoctor/{id}": {
        delete: {
          tags: ["Doctors"],
          summary: "Delete a doctor by id",
          parameters: [idParam],
          responses: {
            200: { description: "Doctor deleted successfully" },
            404: { description: "Doctor not found" },
          },
        },
      },
      "/api/v1/schedules/createSchedule": {
        post: {
          tags: ["Schedules"],
          summary: "Create a schedule slot for a doctor",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateScheduleInput" },
              },
            },
          },
          responses: {
            201: { description: "Schedule created successfully" },
            400: { description: "Validation failed or invalid doctor reference" },
          },
        },
      },
      "/api/v1/schedules/getSchedules": {
        get: {
          tags: ["Schedules"],
          summary: "List a doctor's schedule slots",
          parameters: [
            {
              in: "query",
              name: "doctorId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Schedules fetched successfully" },
            400: { description: "doctorId query param is required" },
          },
        },
      },
      "/api/v1/schedules/getScheduleById/{id}": {
        get: {
          tags: ["Schedules"],
          summary: "Get a schedule slot by id",
          parameters: [idParam],
          responses: {
            200: { description: "Schedule fetched successfully" },
            404: { description: "No such schedule" },
          },
        },
      },
      "/api/v1/schedules/updateSchedule/{id}": {
        patch: {
          tags: ["Schedules"],
          summary: "Update a schedule slot by id",
          parameters: [idParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateScheduleInput" },
              },
            },
          },
          responses: {
            200: { description: "Schedule updated successfully" },
            400: { description: "Validation failed" },
            404: { description: "Schedule not found" },
          },
        },
      },
      "/api/v1/schedules/deleteSchedule/{id}": {
        delete: {
          tags: ["Schedules"],
          summary: "Delete a schedule slot by id",
          parameters: [idParam],
          responses: {
            200: { description: "Schedule deleted successfully" },
            404: { description: "Schedule not found" },
          },
        },
      },
      "/api/v1/appointments/createAppointment": {
        post: {
          tags: ["Appointments"],
          summary: "Create an appointment",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateAppointmentInput" },
              },
            },
          },
          responses: {
            201: { description: "Appointment created successfully" },
            400: { description: "Validation failed or invalid doctor reference" },
          },
        },
      },
      "/api/v1/appointments/getAppointments": {
        get: {
          tags: ["Appointments"],
          summary: "List appointments (paginated, filterable, searchable)",
          parameters: [
            {
              in: "query",
              name: "page",
              schema: { type: "integer", default: 1, minimum: 1 },
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
            },
            { in: "query", name: "doctorId", schema: { type: "string" } },
            { in: "query", name: "status", schema: appointmentStatus },
            {
              in: "query",
              name: "search",
              schema: { type: "string" },
              description: "Matches patient name",
            },
          ],
          responses: {
            200: {
              description:
                "Paginated appointments: data = { items, total, page, limit }",
            },
          },
        },
      },
      "/api/v1/appointments/getAppointmentById/{id}": {
        get: {
          tags: ["Appointments"],
          summary: "Get an appointment by id",
          parameters: [idParam],
          responses: {
            200: { description: "Appointment fetched successfully" },
            404: { description: "No such appointment" },
          },
        },
      },
      "/api/v1/appointments/updateAppointment/{id}": {
        patch: {
          tags: ["Appointments"],
          summary: "Update an appointment by id",
          parameters: [idParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateAppointmentInput" },
              },
            },
          },
          responses: {
            200: { description: "Appointment updated successfully" },
            400: { description: "Validation failed" },
            404: { description: "Appointment not found" },
          },
        },
      },
      "/api/v1/appointments/deleteAppointment/{id}": {
        delete: {
          tags: ["Appointments"],
          summary: "Delete an appointment by id",
          parameters: [idParam],
          responses: {
            200: { description: "Appointment deleted successfully" },
            404: { description: "Appointment not found" },
          },
        },
      },
      "/api/v1/exceptions/createException": {
        post: {
          tags: ["Exceptions"],
          summary: "Create a schedule exception for a doctor",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateExceptionInput" },
              },
            },
          },
          responses: {
            201: { description: "Exception created successfully" },
            400: { description: "Validation failed or invalid doctor reference" },
            409: { description: "An exception already exists for that date" },
          },
        },
      },
      "/api/v1/exceptions/getExceptions": {
        get: {
          tags: ["Exceptions"],
          summary: "List a doctor's schedule exceptions",
          parameters: [
            {
              in: "query",
              name: "doctorId",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Exceptions fetched successfully" },
            400: { description: "doctorId query param is required" },
          },
        },
      },
      "/api/v1/exceptions/getExceptionById/{id}": {
        get: {
          tags: ["Exceptions"],
          summary: "Get a schedule exception by id",
          parameters: [idParam],
          responses: {
            200: { description: "Exception fetched successfully" },
            404: { description: "No such exception" },
          },
        },
      },
      "/api/v1/exceptions/updateException/{id}": {
        patch: {
          tags: ["Exceptions"],
          summary: "Update a schedule exception by id",
          parameters: [idParam],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateExceptionInput" },
              },
            },
          },
          responses: {
            200: { description: "Exception updated successfully" },
            400: { description: "Validation failed" },
            404: { description: "Exception not found" },
          },
        },
      },
      "/api/v1/exceptions/deleteException/{id}": {
        delete: {
          tags: ["Exceptions"],
          summary: "Delete a schedule exception by id",
          parameters: [idParam],
          responses: {
            200: { description: "Exception deleted successfully" },
            404: { description: "Exception not found" },
          },
        },
      },
      "/api/v1/analytics/getDashboardStats": {
        get: {
          tags: ["Analytics"],
          summary: "Aggregated dashboard stats",
          responses: {
            200: {
              description:
                "data = { totalDoctors, totalPatients, todaysAppointments, upcomingAppointments, weeklyAppointments[], appointmentsTrend[], appointmentsByStatus[], recentAppointments[], latestDoctors[] }",
            },
          },
        },
      },
      "/api/v1/analytics/getAnalytics": {
        get: {
          tags: ["Analytics"],
          summary: "Aggregated analytics metrics",
          responses: {
            200: {
              description:
                "data = { totalAppointments, activeDoctors, totalDoctors, totalPatients, averageAppointmentMinutes, appointmentsByStatus[], appointmentsTrend[], weeklyAppointments[] }",
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
