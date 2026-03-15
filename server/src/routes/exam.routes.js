
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { checkReadiness, generateExam, submitExam } from "../controllers/exam.controller.js";

const router = express.Router();

router.get("/readiness/:courseId", protect, checkReadiness);
router.post("/generate", protect, generateExam);
router.post("/submit", protect, submitExam);

export default router;
