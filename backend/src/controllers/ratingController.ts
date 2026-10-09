import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const submitOrUpdateRating = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { storeId, rating } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!storeId || typeof storeId !== 'string') {
      return res.status(400).json({ message: 'Store ID is required.' });
    }

    const ratingVal = Number(rating);
    if (!Number.isInteger(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const upsertedRating = await prisma.rating.upsert({
      where: {
        userId_storeId: {
          userId,
          storeId,
        },
      },
      update: {
        value: ratingVal,
      },
      create: {
        userId,
        storeId,
        value: ratingVal,
      },
    });

    return res.json({
      message: 'Rating submitted successfully',
      rating: upsertedRating,
    });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
