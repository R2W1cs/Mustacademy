import express from "express";
import { generateCareerArchitecture, getCareerRoadmap, generateFullRoadmap } from "../controllers/career.controller.js";
import { protect, requirePremium } from "../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Professional Trajectory Endpoints
router.post("/analyze", protect, generateCareerArchitecture);
router.get("/roadmap", protect, getCareerRoadmap);
router.post("/roadmap/generate", protect, requirePremium, generateFullRoadmap);

export default router;
