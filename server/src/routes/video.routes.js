import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getCourseVideos, uploadVideo, likeVideo, submitFeedback, getVideoFeedback, deleteVideo, toggleVisibility } from "../controllers/video.controller.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadPath = "uploads/videos";
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const ALLOWED_VIDEO_EXT = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v'];

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeOk = ALLOWED_VIDEO_MIME.includes(file.mimetype);
        const extOk = ALLOWED_VIDEO_EXT.includes(ext);
        if (mimeOk && extOk) return cb(null, true);
        cb(new Error('Only video files are allowed (mp4, webm, ogg, mov, m4v).'));
    },
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
