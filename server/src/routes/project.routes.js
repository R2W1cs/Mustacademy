import express from 'express';
import {
    getAllProjects,
    createProject,
    requestToJoin,
    getMyProjectRequests,
    handleRequest,
    getMyProjects,
    updateProject,
    getProjectMembers,
    deleteProject,
    removeMember
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllProjects);
router.post('/', createProject);
router.post('/join', requestToJoin);
router.get('/my-projects', getMyProjects);
router.get('/requests', getMyProjectRequests);
router.patch('/requests/:request_id', handleRequest);
router.patch('/:id', updateProject);
router.get('/:id/members', getProjectMembers);
router.delete('/:id', deleteProject);
router.delete('/:id/members/:userId', removeMember);

export default router;
