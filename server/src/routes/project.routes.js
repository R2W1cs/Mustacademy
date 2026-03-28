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
    removeMember,
    getSquadMessages,
    sendSquadMessage,
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    updateProjectPhase,
    updateProjectStatus,
    updateMemberRole,
    getReports,
    submitReport
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validate.js';

const router = express.Router();

router.use(protect);

const GITHUB_URL = /^https:\/\/(www\.)?github\.com\/.+/i;

const projectSchema = {
    title:       { required: true,  type: 'string', maxLength: 100 },
    description: { required: true,  type: 'string', maxLength: 2000 },
    github_repo: { required: false, type: 'string', pattern: GITHUB_URL, patternMsg: 'github_repo must be a valid GitHub URL' },
};

const joinSchema = {
    project_id:  { required: true },
    message:     { required: false, type: 'string', maxLength: 1000 },
    motivation:  { required: false, type: 'string', maxLength: 1000 },
    contribution:{ required: false, type: 'string', maxLength: 1000 },
};

const reportSchema = {
    what_done: { required: true,  type: 'string', maxLength: 5000 },
    what_next: { required: true,  type: 'string', maxLength: 5000 },
    blockers:  { required: false, type: 'string', maxLength: 2000 },
};

router.get('/', getAllProjects);
router.post('/', validate(projectSchema), createProject);
router.post('/join', validate(joinSchema), requestToJoin);
router.get('/my-projects', getMyProjects);
router.get('/requests', getMyProjectRequests);
router.patch('/requests/:request_id', handleRequest);
router.patch('/:id', updateProject);
router.patch('/:id/phase', updateProjectPhase);
router.patch('/:id/status', updateProjectStatus);
router.get('/:id/members', getProjectMembers);
router.patch('/:id/members/:userId/role', updateMemberRole);
router.delete('/:id', deleteProject);
router.delete('/:id/members/:userId', removeMember);
router.get('/:id/chat', getSquadMessages);
router.post('/:id/chat', sendSquadMessage);
router.get('/:id/tasks', getTasks);
router.post('/:id/tasks', createTask);
router.patch('/:id/tasks/:taskId', updateTask);
router.delete('/:id/tasks/:taskId', deleteTask);
router.get('/:id/reports', getReports);
router.post('/:id/reports', validate(reportSchema), submitReport);

export default router;
