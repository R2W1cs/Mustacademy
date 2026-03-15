import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  enrollInCourse,
  getMyCourses,
  updateCourseStatus,
} from "../controllers/enroll.controller.js";

const router = express.Router();

router.post("/", protect, enrollInCourse);
router.get("/me", protect, getMyCourses);
router.patch("/status", protect, updateCourseStatus);

export default router;
