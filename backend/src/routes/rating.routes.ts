import { Router } from 'express';
import { submitOrUpdateRating } from '../controllers/rating.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { submitRatingSchema } from '../schemas/rating.schema';
import { Role } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticateToken,
  requireRole([Role.NORMAL_USER]),
  validateRequest({ body: submitRatingSchema }),
  submitOrUpdateRating
);

export default router;
