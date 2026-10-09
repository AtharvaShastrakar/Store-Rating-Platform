import { Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    return res.json({ success: true, ...stats });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await adminService.createUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const store = await adminService.createStore(req.body);
    return res.status(201).json({
      success: true,
      message: 'Store created successfully',
      store,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const users = await adminService.getUsers(req.query as any);
    return res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;
    const user = await adminService.getUserDetails(userId);
    return res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const getStores = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stores = await adminService.getStores(req.query as any);
    return res.json({ success: true, stores });
  } catch (error) {
    next(error);
  }
};
