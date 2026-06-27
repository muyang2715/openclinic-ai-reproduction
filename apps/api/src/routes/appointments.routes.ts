import express, { Router } from "express";
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointments.controller";

const router: Router = express.Router();

router.post("/createAppointment", createAppointment);
router.get("/getAppointments", getAppointments);
router.get("/getAppointmentById/:id", getAppointment);
router.patch("/updateAppointment/:id", updateAppointment);
router.delete("/deleteAppointment/:id", deleteAppointment);

export default router;
