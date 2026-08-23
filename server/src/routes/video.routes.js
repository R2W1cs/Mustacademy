import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getCourseVideos, uploadVideo, likeVideo, submitFeedback, getVideoFeedback, deleteVideo, toggleVisibility } from "../controllers/video.controller.js";
import { validateVideoUpload, validateVideoFeedback } from "../utils/validate.js";
import multer from "multer";
import path from "path";

const ALLOWED_VIDEO_EXT = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-m4v'];

const upload = multer({
    storage: multer.memoryStorage(),
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
router.post("/upload", protect, upload.single("videoFile"), validateVideoUpload, uploadVideo);
router.post("/:videoId/like", protect, likeVideo);
router.get("/:videoId/feedback", protect, getVideoFeedback);
router.post("/:videoId/feedback", protect, validateVideoFeedback, submitFeedback);
router.delete("/:videoId", protect, deleteVideo);
router.put("/:videoId/visibility", protect, toggleVisibility);

export default router;
