import express, { Router } from "express";
import {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
} from "../controllers/doctors.controller";

const router: Router = express.Router();

router.post("/createDoctor", createDoctor);
router.get("/getDoctors", getDoctors);
router.get("/getDoctorById/:id", getDoctor);
router.patch("/updateDoctor/:id", updateDoctor);
router.delete("/deleteDoctor/:id", deleteDoctor);

export default router;
