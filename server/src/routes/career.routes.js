import express from "express";
import { generateCareerArchitecture, getCareerRoadmap, scanResume } from "../controllers/career.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Professional Trajectory Endpoints
router.post("/analyze", protect, generateCareerArchitecture);
router.get("/roadmap", protect, getCareerRoadmap);

export default router;
