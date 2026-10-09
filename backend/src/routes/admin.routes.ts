import { Router } from 'express';
import {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getUserDetails,
  getStores,
} from '../controllers/admin.controller';
import { authenticateToken, requireRole } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  createUserSchema,
  createStoreSchema,
  getUsersQuerySchema,
  getStoresQuerySchema,
} from '../schemas/admin.schema';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken, requireRole([Role.ADMIN]));

router.get('/dashboard-stats', getDashboardStats);
router.post('/users', validateRequest({ body: createUserSchema }), createUser);
router.get('/users', validateRequest({ query: getUsersQuerySchema }), getUsers);
router.get('/users/:id', getUserDetails);
router.post('/stores', validateRequest({ body: createStoreSchema }), createStore);
router.get('/stores', validateRequest({ query: getStoresQuerySchema }), getStores);

export default router;
