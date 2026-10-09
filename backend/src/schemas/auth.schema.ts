import { z } from 'zod';

export const nameValidation = z
  .string({ required_error: 'Name is required' })
  .trim()
  .min(20, 'Name must be between 20 and 60 characters long')
  .max(60, 'Name must be between 20 and 60 characters long');

export const emailValidation = z
  .string({ required_error: 'Email is required' })
  .trim()
  .email('Must follow standard email validation rules (e.g. user@example.com)');

export const addressValidation = z
  .string({ required_error: 'Address is required' })
  .trim()
  .min(1, 'Address cannot be empty')
  .max(400, 'Address cannot exceed 400 characters');

export const passwordValidation = z
  .string({ required_error: 'Password is required' })
  .min(8, 'Password must be between 8 and 16 characters long')
  .max(16, 'Password must be between 8 and 16 characters long')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must include at least one special character');

export const signupSchema = z.object({
  name: nameValidation,
  email: emailValidation,
  password: passwordValidation,
  address: addressValidation,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: passwordValidation,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
