import express, { Router } from "express";
import {
  createException,
  getExceptions,
  getException,
  updateException,
  deleteException,
} from "../controllers/exceptions.controller";

const router: Router = express.Router();

router.post("/createException", createException);
router.get("/getExceptions", getExceptions);
router.get("/getExceptionById/:id", getException);
router.patch("/updateException/:id", updateException);
router.delete("/deleteException/:id", deleteException);

export default router;
