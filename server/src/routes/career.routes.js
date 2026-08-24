import express from "express";
import { generateCareerArchitecture, getCareerRoadmap, generateFullRoadmap } from "../controllers/career.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Professional Trajectory Endpoints
router.post("/analyze", protect, generateCareerArchitecture);
router.get("/roadmap", protect, getCareerRoadmap);
// Auth only — self-serve premium upgrades are disabled, so requirePremium
// made roadmap generation fail for nearly every account.
router.post("/roadmap/generate", protect, generateFullRoadmap);

export default router;
