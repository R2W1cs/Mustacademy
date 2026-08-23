import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getThreads,
    createThread,
    getThreadDetails,
    createComment,
    toggleUpvote
} from "../controllers/forum.controller.js";
import {
    validateCreateThread,
    validateCreateComment,
    validateToggleUpvote,
} from "../utils/validate.js";

const router = express.Router();

router.get("/threads", protect, getThreads);
router.post("/threads", protect, validateCreateThread, createThread);
router.get("/threads/:id", protect, getThreadDetails);
router.post("/comments", protect, validateCreateComment, createComment);
router.post("/upvote", protect, validateToggleUpvote, toggleUpvote);

export default router;
