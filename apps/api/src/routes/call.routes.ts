import express, { Router } from "express";

import { getCalls, getCallById } from "../controllers/call.controller";

const router: Router = express.Router();

router.get("/getCalls", getCalls);
router.get("/getCallById/:id", getCallById);

export default router;
