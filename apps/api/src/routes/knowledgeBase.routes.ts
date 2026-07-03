import express, { Router } from "express";
import multer from "multer";

import { MAX_UPLOAD_BYTES } from "../config/constants";
import {
  uploadDocument,
  getDocuments,
  deleteDocument,
} from "../controllers/knowledgeBase.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

const router: Router = express.Router();

router.post("/uploadDocument", upload.single("file"), uploadDocument);
router.get("/getDocuments", getDocuments);
router.delete("/deleteDocument/:id", deleteDocument);

export default router;
