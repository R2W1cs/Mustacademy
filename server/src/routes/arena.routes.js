import express from 'express';
import { getLeaderboard } from '../controllers/arena.controller.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);

export default router;
