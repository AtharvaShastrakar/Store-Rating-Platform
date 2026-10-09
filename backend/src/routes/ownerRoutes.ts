import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/ownerController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/dashboard', authenticateToken, requireRole([Role.STORE_OWNER]), getOwnerDashboard);

export default router;
