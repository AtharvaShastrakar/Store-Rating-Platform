import { Router } from 'express';
import { submitOrUpdateRating } from '../controllers/ratingController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/', authenticateToken, requireRole([Role.NORMAL_USER]), submitOrUpdateRating);

export default router;
