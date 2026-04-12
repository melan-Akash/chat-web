import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createStatus, getStatuses, viewStatus } from '../controllers/status.controller.js';

const router = express.Router();

router.post('/upload', protectRoute, createStatus);
router.get('/', protectRoute, getStatuses);
router.post('/view/:id', protectRoute, viewStatus);

export default router;
