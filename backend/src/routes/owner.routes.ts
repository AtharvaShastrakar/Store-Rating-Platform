import { Router } from 'express';
import { getOwnerDashboard } from '../controllers/owner.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/dashboard', authenticateToken, requireRole([Role.STORE_OWNER]), getOwnerDashboard);

export default router;
