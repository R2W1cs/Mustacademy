import express from "express";
import multer from "multer";
import {
  getAllCourses,
  getCoursesBySemester,
  getCourseById,
  getCourseTopics,
  getTopicProgress,
  getTopicById,
  toggleTopicCompletion,
  getRecommendedCourses,
  getAllTopics,
  getTopicNote,
  updateTopicNote,
  uploadTopicResource,
  getTopicResources,
  deleteTopicResource,
} from "../controllers/course.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['pdf', 'docx', 'pptx', 'txt', 'md'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('File type not supported. Use PDF, DOCX, PPTX, TXT, or MD.'));
  }
});

// --- STATIC ROUTES FIRST (must come before dynamic /:id) ---
router.get("/", getAllCourses);
router.get("/year/:year/semester/:semester", getCoursesBySemester);
router.get("/recommended", protect, getRecommendedCourses);

// --- TOPIC SUB-ROUTES ---
router.get("/topics/all", getAllTopics);
router.get("/topics/:id/note", protect, getTopicNote);
router.post("/topics/:id/note", protect, updateTopicNote);
router.get("/topics/:id/resources", protect, getTopicResources);
router.post("/topics/:id/resources", protect, upload.single("file"), uploadTopicResource);
router.delete("/topics/:id/resources/:resourceId", protect, deleteTopicResource);
router.get("/topics/:id", protect, getTopicById);
router.post("/topics/toggle", protect, toggleTopicCompletion);

// --- DYNAMIC COURSE ROUTES ---
router.get("/:id", getCourseById);
router.get("/:id/topics", getCourseTopics);
router.get("/:courseId/topics/progress", protect, getTopicProgress);

export default router;
