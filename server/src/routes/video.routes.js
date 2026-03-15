import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getCourseVideos, uploadVideo, likeVideo, submitFeedback, getVideoFeedback, deleteVideo, toggleVisibility } from "../controllers/video.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = "uploads/videos";
        // Ensure directory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const router = express.Router();

router.get("/:courseId", protect, getCourseVideos);
router.post("/upload", protect, upload.single("videoFile"), uploadVideo);
router.post("/:videoId/like", protect, likeVideo);
router.get("/:videoId/feedback", protect, getVideoFeedback);
router.post("/:videoId/feedback", protect, submitFeedback);
router.delete("/:videoId", protect, deleteVideo);
router.put("/:videoId/visibility", protect, toggleVisibility);

export default router;
