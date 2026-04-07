import express from 'express';
import { generateTTS } from '../controllers/tts.controller.js';

const router = express.Router();

/**
 * @route POST /api/tts
 * @desc Generate high-quality Neural TTS audio
 * @access Public
 */
router.post('/', generateTTS);
// GET variant: browser <audio src> can stream chunks immediately (no blob buffering)
router.get('/', generateTTS);

export default router;
