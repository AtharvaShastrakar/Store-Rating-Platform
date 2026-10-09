import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../errors/AppError';

export const validateRequest = (schema: {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        const parsedQuery = await schema.query.parseAsync(req.query);
        Object.keys(req.query).forEach((key) => delete (req.query as any)[key]);
        Object.assign(req.query, parsedQuery);
      }
      if (schema.params) {
        const parsedParams = await schema.params.parseAsync(req.params);
        Object.assign(req.params, parsedParams);
      }
      next();
    } catch (error: any) {
      if (error instanceof ZodError || (error && Array.isArray(error.issues))) {
        const issues = error.issues || error.errors || [];
        const formattedErrors = issues.map((err: any) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
          message: err.message,
        }));
        return next(new ValidationError('Form validation failed', formattedErrors));
      }
      next(error);
    }
  };
};
