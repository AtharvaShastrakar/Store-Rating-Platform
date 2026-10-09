import { Router } from 'express';
import { getStoresForUser } from '../controllers/store.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { userStoresQuerySchema } from '../schemas/store.schema';

const router = Router();

router.get('/', authenticateToken, validateRequest({ query: userStoresQuerySchema }), getStoresForUser);

export default router;
