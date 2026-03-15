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
router.post("/scan-resume", protect, (req, res, next) => {
    console.log("[ATS Route] Incoming request for /scan-resume...");
    console.log("[ATS Route] Content-Type:", req.headers['content-type']);
    next();
}, (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
        if (err) {
            console.error("[ATS Route] Multer Error:", err);
            return res.status(400).json({ message: "Document upload protocol failure.", error: err.message });
        }
        next();
    });
}, scanResume);

export default router;
