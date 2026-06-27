import express, { Router } from "express";
import {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
} from "../controllers/schedules.controller";

const router: Router = express.Router();

router.post("/createSchedule", createSchedule);
router.get("/getSchedules", getSchedules);
router.get("/getScheduleById/:id", getSchedule);
router.patch("/updateSchedule/:id", updateSchedule);
router.delete("/deleteSchedule/:id", deleteSchedule);

export default router;
