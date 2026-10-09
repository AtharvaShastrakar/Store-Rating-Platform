import { prisma } from '../db';

export class StoreService {
  /**
   * Retrieves all stores for normal user display, calculating overall rating and current user's submitted rating.
   */
  public async getStoresForUser(
    userId: string | undefined,
    query: { search?: string; name?: string; address?: string; sortBy?: string; sortOrder?: string }
  ) {
    const { search, name, address, sortBy = 'name', sortOrder = 'asc' } = query;

    const where: any = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    } else {
      if (name && name.trim() !== '') {
        where.name = { contains: name.trim(), mode: 'insensitive' };
      }
      if (address && address.trim() !== '') {
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

      const userRatingObj = userId ? store.ratings.find((r) => r.userId === userId) : null;
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

    const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;

    formattedStores.sort((a: any, b: any) => {
      if (sortBy === 'overallRating') {
        return (a.overallRating - b.overallRating) * order;
      }
      if (sortBy === 'userSubmittedRating' || sortBy === 'myRating') {
        const ratingA = a.userSubmittedRating ?? -1;
        const ratingB = b.userSubmittedRating ?? -1;
        return (ratingA - ratingB) * order;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * order;
      }
      return a.name.localeCompare(b.name) * order;
    });

    return formattedStores;
  }
}

export const storeService = new StoreService();
