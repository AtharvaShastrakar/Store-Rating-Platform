import { z } from 'zod';

export const submitRatingSchema = z.object({
  storeId: z.string({ required_error: 'Store ID is required' }).min(1, 'Store ID cannot be empty'),
  rating: z
    .number({ required_error: 'Rating is required' })
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

export type SubmitRatingInput = z.infer<typeof submitRatingSchema>;
