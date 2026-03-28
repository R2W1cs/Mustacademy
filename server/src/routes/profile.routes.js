

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getMyProfile,
  updateProfile,
  upgradePlan,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/", protect, updateProfile);
router.patch("/plan", protect, upgradePlan);

export default router;
