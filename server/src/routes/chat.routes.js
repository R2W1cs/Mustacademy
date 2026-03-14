import express from "express";
import multer from 'multer';
import path from 'path';
import { protect } from "../middleware/auth.middleware.js";
import { getRooms, createRoom, joinRoom, getRoomMessages, sendMessage, toggleVoice, getRoomMembers, startDirectMessage, inviteUser } from "../controllers/chat.controller.js";

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// Upload File
router.post("/upload", protect, upload.single('file'), (req, res) => {
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: fileUrl, type: req.file.mimetype });
});

// DM Management
router.post("/dm", protect, startDirectMessage);

// Room Management
router.get("/rooms", protect, getRooms);
router.post("/rooms", protect, createRoom);
router.post("/rooms/:roomId/join", protect, joinRoom);
router.post("/rooms/:roomId/invite", protect, inviteUser);
router.get("/rooms/:roomId/members", protect, getRoomMembers);

// Message Management
router.get("/rooms/:roomId/messages", protect, getRoomMessages);
router.post("/rooms/:roomId/messages", protect, sendMessage);

// Voice Presence
router.put("/rooms/:roomId/voice", protect, toggleVoice);

export default router;
