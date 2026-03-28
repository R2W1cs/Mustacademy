import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { listKBFiles, readKBFile, writeKBFile, deleteKBFile } from '../controllers/admin.controller.js';

const router = express.Router();

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

router.use(protect, requireAdmin);

router.get('/kb', listKBFiles);
router.get('/kb/:name', readKBFile);
router.put('/kb/:name', writeKBFile);
router.delete('/kb/:name', deleteKBFile);

export default router;
