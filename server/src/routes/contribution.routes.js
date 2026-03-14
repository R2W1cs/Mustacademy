import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyContributionStats, uploadSummary, uploadCheatsheet, submitReview, deleteAsset, toggleVisibility, hideFromStudent, getCohortLeaderboard } from "../controllers/contribution.controller.js";

const router = express.Router();

router.get("/me", protect, getMyContributionStats);
router.get("/leaderboard", protect, getCohortLeaderboard);
router.post("/summary", protect, uploadSummary);
router.post("/cheatsheet", protect, uploadCheatsheet);
router.post("/review", protect, submitReview);
router.delete("/:assetId", protect, deleteAsset);
router.patch("/:assetId/visibility", protect, toggleVisibility);
router.post("/hide-from-student", protect, hideFromStudent);

export default router;
