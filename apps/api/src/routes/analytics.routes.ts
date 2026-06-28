import express, { Router } from "express";
import {
  getDashboardStats,
  getAnalytics,
} from "../controllers/analytics.controller";

const router: Router = express.Router();

router.get("/getDashboardStats", getDashboardStats);
router.get("/getAnalytics", getAnalytics);

export default router;
