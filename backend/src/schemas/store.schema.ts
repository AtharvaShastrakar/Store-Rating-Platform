import { z } from 'zod';

export const userStoresQuerySchema = z.object({
  search: z.string().optional(),
  name: z.string().optional(),
  address: z.string().optional(),
  sortBy: z.enum(['name', 'address', 'overallRating', 'myRating', 'userSubmittedRating']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
