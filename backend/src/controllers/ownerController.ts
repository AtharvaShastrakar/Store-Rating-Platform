import { Response } from 'express';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getOwnerDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { sortBy = 'createdAt', sortOrder = 'desc', search } = req.query;

    // Find stores owned by this store owner
    const stores = await prisma.store.findMany({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                address: true,
              },
            },
          },
        },
      },
    });

    if (stores.length === 0) {
      return res.json({
        hasStore: false,
        message: 'No stores currently assigned to your account.',
        stores: [],
      });
    }

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.value, 0);
      const averageRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;

      let submittedRatings = store.ratings.map((r) => ({
        ratingId: r.id,
        user: r.user,
        rating: r.value,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));

      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        submittedRatings = submittedRatings.filter(
          (item) =>
            item.user.name.toLowerCase().includes(q) ||
            item.user.email.toLowerCase().includes(q)
        );
      }

      const order = (sortOrder as string).toLowerCase() === 'asc' ? 1 : -1;
      const field = sortBy as string;

      submittedRatings.sort((a: any, b: any) => {
        if (field === 'rating') {
          return (a.rating - b.rating) * order;
        }
        if (field === 'name') {
          return a.user.name.localeCompare(b.user.name) * order;
        }
        if (field === 'email') {
          return a.user.email.localeCompare(b.user.email) * order;
        }
        return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
      });

      return {
        storeId: store.id,
        storeName: store.name,
        storeEmail: store.email,
        storeAddress: store.address,
        averageRating,
        totalRatings,
        ratingsList: submittedRatings,
      };
    });

    return res.json({
      hasStore: true,
      stores: formattedStores,
    });
  } catch (error: any) {
    console.error('Error fetching store owner dashboard:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
