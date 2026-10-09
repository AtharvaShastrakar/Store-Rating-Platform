import { Router } from 'express';
import { getStoresForUser } from '../controllers/storeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getStoresForUser);

export default router;
