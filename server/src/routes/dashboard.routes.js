import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getDashboardStats, getKnowledgeMap } from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", protect, getDashboardStats);
router.get("/knowledge-map", protect, getKnowledgeMap);

export default router;
