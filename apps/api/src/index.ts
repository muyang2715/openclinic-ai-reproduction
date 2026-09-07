import http from "http";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { Server } from "socket.io";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@repo/shared";
import { PORT, WEB_ORIGIN } from "./config/config";
import { swaggerSpec } from "./config/swagger";
import { registerSocketHandlers } from "./sockets/gateway";
import doctorsRouter from "./routes/doctors.routes";
import schedulesRouter from "./routes/schedules.routes";
import appointmentsRouter from "./routes/appointments.routes";
import exceptionsRouter from "./routes/exceptions.routes";
import analyticsRouter from "./routes/analytics.routes";
import knowledgeBaseRouter from "./routes/knowledgeBase.routes";
import agentRouter from "./routes/agent.routes";
import callsRouter from "./routes/call.routes";
import { errorHandler } from "./middleware/errorHandler";
import { prisma } from "./libs/prisma";

const app = express();

app.use(cors({ origin: WEB_ORIGIN }));
app.use(express.json());

// Lightweight readiness probe for local demos and deployment platforms. A
// successful response means both the HTTP process and PostgreSQL are ready.
app.get("/api/v1/health", async (_req, res) => {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    return res.status(200).json({
      success: true,
      message: "OpenClinic API is healthy",
      data: { status: "ok", database: "connected" },
    });
  } catch (error) {
    console.error("[health] database check failed", error);
    return res.status(503).json({
      success: false,
      message: "OpenClinic API is not ready",
      data: { status: "degraded", database: "unavailable" },
    });
  }
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/doctors", doctorsRouter);
app.use("/api/v1/schedules", schedulesRouter);
app.use("/api/v1/appointments", appointmentsRouter);
app.use("/api/v1/exceptions", exceptionsRouter);
app.use("/api/v1/analytics", analyticsRouter);
app.use("/api/v1/knowledgeBase", knowledgeBaseRouter);
app.use("/api/v1/agent", agentRouter);
app.use("/api/v1/calls", callsRouter);

app.use(errorHandler);

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: { origin: WEB_ORIGIN },
});
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
