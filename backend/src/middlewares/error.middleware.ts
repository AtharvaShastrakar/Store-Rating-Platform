import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.warn(`AppError [${err.code}]: ${err.message}`, { details: err.details, path: req.path });
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
      // Provide legacy errors array for frontend backward compatibility
      errors: Array.isArray(err.details) ? err.details : undefined,
    });
  }

  logger.error(`Unhandled Exception: ${err.message}`, { stack: err.stack, path: req.path });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
};
