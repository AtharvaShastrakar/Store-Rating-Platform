import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getStoresForUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, address, search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where: any = {};

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    } else {
      if (name && typeof name === 'string' && name.trim() !== '') {
        where.name = { contains: name.trim(), mode: 'insensitive' };
      }
      if (address && typeof address === 'string' && address.trim() !== '') {
        where.address = { contains: address.trim(), mode: 'insensitive' };
      }
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        ratings: true,
      },
    });

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.value, 0);
      const overallRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;

      const userRatingObj = userId
        ? store.ratings.find((r) => r.userId === userId)
        : null;

      const userSubmittedRating = userRatingObj ? userRatingObj.value : null;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        overallRating,
        totalRatings,
        userSubmittedRating,
        ratingId: userRatingObj ? userRatingObj.id : null,
      };
    });

    const order = (sortOrder as string).toLowerCase() === 'desc' ? -1 : 1;
    const field = sortBy as string;

    formattedStores.sort((a: any, b: any) => {
      if (field === 'overallRating') {
        return (a.overallRating - b.overallRating) * order;
      }
      if (field === 'userSubmittedRating' || field === 'myRating') {
        const ratingA = a.userSubmittedRating ?? -1;
        const ratingB = b.userSubmittedRating ?? -1;
        return (ratingA - ratingB) * order;
      }
      if (field === 'address') {
        return a.address.localeCompare(b.address) * order;
      }
      return a.name.localeCompare(b.name) * order;
    });

    return res.json({ stores: formattedStores });
  } catch (error: any) {
    console.error('Error fetching stores for user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
