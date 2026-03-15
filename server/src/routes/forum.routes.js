import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
    getThreads,
    createThread,
    getThreadDetails,
    createComment,
    toggleUpvote
} from "../controllers/forum.controller.js";

const router = express.Router();

router.get("/threads", protect, getThreads);
router.post("/threads", protect, createThread);
router.get("/threads/:id", protect, getThreadDetails);
router.post("/comments", protect, createComment);
router.post("/upvote", protect, toggleUpvote);

export default router;
