import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { PORT, WEB_ORIGIN } from "./config/config";
import { swaggerSpec } from "./config/swagger";
import doctorsRouter from "./routes/doctors.routes";
import schedulesRouter from "./routes/schedules.routes";
import appointmentsRouter from "./routes/appointments.routes";
import exceptionsRouter from "./routes/exceptions.routes";
import analyticsRouter from "./routes/analytics.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(cors({ origin: WEB_ORIGIN }));
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/v1/doctors", doctorsRouter);
app.use("/api/v1/schedules", schedulesRouter);
app.use("/api/v1/appointments", appointmentsRouter);
app.use("/api/v1/exceptions", exceptionsRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
