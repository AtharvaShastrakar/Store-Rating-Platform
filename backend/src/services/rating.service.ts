import { prisma } from '../db';
import { SubmitRatingInput } from '../schemas/rating.schema';
import { NotFoundError } from '../errors/AppError';

export class RatingService {
  /**
   * Submits a new rating or updates an existing rating (1 to 5 stars) for a store.
   */
  public async submitOrUpdateRating(userId: string, input: SubmitRatingInput) {
    const store = await prisma.store.findUnique({ where: { id: input.storeId } });
    if (!store) {
      throw new NotFoundError('Store not found');
    }

    const rating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId: input.storeId,
        },
      },
      update: {
        value: input.rating,
      },
      create: {
        userId,
        storeId: input.storeId,
        value: input.rating,
      },
    });

    return rating;
  }
}

export const ratingService = new RatingService();
