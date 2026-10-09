import { Response, NextFunction } from 'express';
import { ratingService } from '../services/rating.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const submitOrUpdateRating = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const rating = await ratingService.submitOrUpdateRating(userId, req.body);
    return res.json({
      success: true,
      message: 'Rating submitted successfully',
      rating,
    });
  } catch (error) {
    next(error);
  }
};
