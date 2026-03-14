import express from "express";
import {
  getAllCourses,
  getCoursesBySemester,
  getCourseById,
  getCourseTopics,
  getTopicProgress,
  getTopicById,
  toggleTopicCompletion,
  getRecommendedCourses,
  getAllTopics
} from "../controllers/course.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// --- STATIC ROUTES FIRST (must come before dynamic /:id) ---
router.get("/", getAllCourses);
router.get("/year/:year/semester/:semester", getCoursesBySemester);
router.get("/recommended", protect, getRecommendedCourses);

// --- TOPIC SUB-ROUTES (static "topics" segment before /:id) ---
router.get("/topics/all", getAllTopics);
router.get("/topics/:id", protect, getTopicById);
router.post("/topics/toggle", protect, toggleTopicCompletion);

// --- DYNAMIC COURSE ROUTES ---
router.get("/:id", getCourseById);
router.get("/:id/topics", getCourseTopics);
router.get("/:courseId/topics/progress", protect, getTopicProgress);

export default router;
