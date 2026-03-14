import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyNotifications, markAsRead, markAllAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);
router.put("/read-all", protect, markAllAsRead);

export default router;
