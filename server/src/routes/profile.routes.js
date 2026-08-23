

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getMyProfile,
  updateProfile,
  upgradePlan,
} from "../controllers/profile.controller.js";
import { validateUpdateProfile } from "../utils/validate.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.put("/", protect, validateUpdateProfile, updateProfile);
router.patch("/plan", protect, upgradePlan);

export default router;
