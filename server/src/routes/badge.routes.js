import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyBadges } from "../controllers/badge.controller.js";

const router = express.Router();

router.get("/", protect, getMyBadges);

export default router;
