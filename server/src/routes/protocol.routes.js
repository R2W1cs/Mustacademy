import express from "express";
import { getAggregatedProtocols } from "../controllers/protocol.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAggregatedProtocols);

export default router;
