import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import storeRoutes from './store.routes';
import ratingRoutes from './rating.routes';
import ownerRoutes from './owner.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/owner', ownerRoutes);

export default router;
