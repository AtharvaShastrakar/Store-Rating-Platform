import { prisma } from '../db';

export class OwnerService {
  /**
   * Retrieves store owner dashboard metrics, including average rating and customer review list.
   */
  public async getOwnerDashboard(userId: string, query: { search?: string; sortBy?: string; sortOrder?: string }) {
    const { search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const stores = await prisma.store.findMany({
      where: { ownerId: userId },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true, address: true },
            },
          },
        },
      },
    });

    if (stores.length === 0) {
      return {
        hasStore: false,
        message: 'No stores currently assigned to your account.',
        stores: [],
      };
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

      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        submittedRatings = submittedRatings.filter(
          (item) => item.user.name.toLowerCase().includes(q) || item.user.email.toLowerCase().includes(q)
        );
      }

      const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;

      submittedRatings.sort((a: any, b: any) => {
        if (sortBy === 'rating') {
          return (a.rating - b.rating) * order;
        }
        if (sortBy === 'name') {
          return a.user.name.localeCompare(b.user.name) * order;
        }
        if (sortBy === 'email') {
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

    return {
      hasStore: true,
      stores: formattedStores,
    };
  }
}

export const ownerService = new OwnerService();
