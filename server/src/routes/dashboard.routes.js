import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getDashboardStats, getKnowledgeMap } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.get("/stats", protect, asyncHandler(getDashboardStats));
router.get("/knowledge-map", protect, asyncHandler(getKnowledgeMap));

export default router;
