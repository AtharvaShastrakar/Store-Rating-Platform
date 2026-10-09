import { Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const signup = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await authService.login(req.body);
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const result = await authService.updatePassword(userId, req.body);
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const user = await authService.getMe(userId);
    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};
