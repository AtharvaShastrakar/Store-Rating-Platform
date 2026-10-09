import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { Role } from '@prisma/client';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Authentication token required'));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ForbiddenError('Invalid or expired token'));
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(
        new ForbiddenError(`Access denied. Requires one of roles: ${allowedRoles.join(', ')}`)
      );
    }

    next();
  };
};
