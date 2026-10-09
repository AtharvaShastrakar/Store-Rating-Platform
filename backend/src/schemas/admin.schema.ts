import { z } from 'zod';
import { Role } from '@prisma/client';
import { nameValidation, emailValidation, passwordValidation, addressValidation } from './auth.schema';

export const createUserSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  address: addressValidation,
  role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Valid role is required (ADMIN, NORMAL_USER, STORE_OWNER)' }) }),
});

export const storeNameValidation = z
  .string({ required_error: 'Store name is required' })
  .trim()
  .min(3, 'Store name must be between 3 and 60 characters long')
  .max(60, 'Store name must be between 3 and 60 characters long');

export const createStoreSchema = z.object({
  name: storeNameValidation,
  email: emailValidation,
  address: addressValidation,
  ownerId: z.string().optional().nullable(),
});

export const getUsersQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'address', 'role', 'createdAt']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export const getStoresQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'address', 'overallRating', 'rating']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateStoreInput = z.infer<typeof createStoreSchema>;
