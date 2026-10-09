import { Response, NextFunction } from 'express';
import { ownerService } from '../services/owner.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getOwnerDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await ownerService.getOwnerDashboard(userId, req.query as any);
    return res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
