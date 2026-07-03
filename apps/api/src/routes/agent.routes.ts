import express, { Router } from "express";
import { chat } from "../controllers/agent.controller";

const router: Router = express.Router();

router.post("/chat", chat);

export default router;
