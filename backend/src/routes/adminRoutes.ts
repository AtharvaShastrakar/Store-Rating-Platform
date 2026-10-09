import { Router } from 'express';
import {
  getDashboardStats,
  createUser,
  createStore,
  getUsers,
  getUserDetails,
  getStores,
} from '../controllers/adminController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Protect all admin routes with ADMIN role
router.use(authenticateToken, requireRole([Role.ADMIN]));

router.get('/dashboard-stats', getDashboardStats);
router.post('/users', createUser);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.post('/stores', createStore);
router.get('/stores', getStores);

export default router;
