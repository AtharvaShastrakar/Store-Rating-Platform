import { Response, NextFunction } from 'express';
import { storeService } from '../services/store.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getStoresForUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const stores = await storeService.getStoresForUser(userId, req.query as any);
    return res.json({ success: true, stores });
  } catch (error) {
    next(error);
  }
};
