import express from "express";
import { protect as verifyToken } from "../middleware/auth.middleware.js";
import { checkTopicAccess, submitQuizResult } from "../controllers/progress.controller.js";

const router = express.Router();

router.get("/access/:topicId", verifyToken, checkTopicAccess);
router.post("/quiz", verifyToken, submitQuizResult);

export default router;
