import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { CreateUserInput, CreateStoreInput } from '../schemas/admin.schema';
import { BadRequestError, NotFoundError } from '../errors/AppError';
import { Role } from '@prisma/client';

export class AdminService {
  /**
   * Fetches dashboard metric counts (total users, total stores, total ratings).
   */
  public async getDashboardStats() {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    return { totalUsers, totalStores, totalRatings };
  }

  /**
   * Creates a new user account (Admin, Normal User, or Store Owner).
   */
  public async createUser(input: CreateUserInput) {
    const emailLower = input.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      throw new BadRequestError('Email is already registered', [
        { field: 'email', message: 'Email is already registered' },
      ]);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: emailLower,
        password: hashedPassword,
        address: input.address.trim(),
        role: input.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Registers a new store and optionally assigns a Store Owner user.
   */
  public async createStore(input: CreateStoreInput) {
    const emailLower = input.email.trim().toLowerCase();

    if (input.ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: input.ownerId } });
      if (!owner || owner.role !== Role.STORE_OWNER) {
        throw new BadRequestError('Assigned owner must be a valid STORE_OWNER user account', [
          { field: 'ownerId', message: 'Assigned owner must be a valid STORE_OWNER user.' },
        ]);
      }
    }

    const existingStore = await prisma.store.findUnique({
      where: { email: emailLower },
    });

    if (existingStore) {
      throw new BadRequestError('Store email already exists', [
        { field: 'email', message: 'Store email already exists.' },
      ]);
    }

    const store = await prisma.store.create({
      data: {
        name: input.name.trim(),
        email: emailLower,
        address: input.address.trim(),
        ownerId: input.ownerId || null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return store;
  }

  /**
   * Retrieves users list with searching (Name, Email, Address), filtering by Role, and sorting.
   */
  public async getUsers(query: { search?: string; role?: string; sortBy?: string; sortOrder?: string }) {
    const { search, role, sortBy = 'name', sortOrder = 'asc' } = query;

    const where: any = {};

    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    const order = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'name';

    const users = await prisma.user.findMany({
      where,
      orderBy: { [orderByField]: order },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            ratings: { select: { value: true } },
          },
        },
      },
    });

    return users.map((user) => {
      let ratingInfo: { averageRating: number | null; totalRatings: number } | null = null;
      if (user.role === Role.STORE_OWNER) {
        let totalVal = 0;
        let count = 0;
        user.ownedStores.forEach((s) => {
          s.ratings.forEach((r) => {
            totalVal += r.value;
            count += 1;
          });
        });
        ratingInfo = {
          averageRating: count > 0 ? Number((totalVal / count).toFixed(1)) : null,
          totalRatings: count,
        };
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        storeRating: ratingInfo,
        ownedStores: user.ownedStores.map((s) => ({ id: s.id, name: s.name })),
      };
    });
  }

  /**
   * Retrieves full details for a single user. If the user is a Store Owner, includes store ratings.
   */
  public async getUserDetails(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            ratings: { select: { value: true } },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    let ratingInfo: { averageRating: number | null; totalRatings: number; stores: any[] } | null = null;
    if (user.role === Role.STORE_OWNER && user.ownedStores) {
      let totalVal = 0;
      let count = 0;
      const storesFormatted = user.ownedStores.map((store) => {
        const storeSum = store.ratings.reduce((acc, curr) => acc + curr.value, 0);
        const storeAvg = store.ratings.length > 0 ? Number((storeSum / store.ratings.length).toFixed(1)) : null;
        totalVal += storeSum;
        count += store.ratings.length;
        return {
          id: store.id,
          name: store.name,
          email: store.email,
          address: store.address,
          averageRating: storeAvg,
          totalRatings: store.ratings.length,
        };
      });

      ratingInfo = {
        averageRating: count > 0 ? Number((totalVal / count).toFixed(1)) : null,
        totalRatings: count,
        stores: storesFormatted,
      };
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      storeRating: ratingInfo,
    };
  }

  /**
   * Retrieves registered stores with searching, sorting, overall ratings, and owner info.
   */
  public async getStores(query: { search?: string; sortBy?: string; sortOrder?: string }) {
    const { search, sortBy = 'name', sortOrder = 'asc' } = query;

    const where: any = {};
    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { value: true } },
      },
    });

    const formattedStores = stores.map((store) => {
      const totalRatings = store.ratings.length;
      const sum = store.ratings.reduce((acc, curr) => acc + curr.value, 0);
      const overallRating = totalRatings > 0 ? Number((sum / totalRatings).toFixed(1)) : 0;

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner: store.owner,
        overallRating,
        totalRatings,
        createdAt: store.createdAt,
      };
    });

    const order = sortOrder.toLowerCase() === 'desc' ? -1 : 1;

    formattedStores.sort((a: any, b: any) => {
      if (sortBy === 'overallRating' || sortBy === 'rating') {
        return (a.overallRating - b.overallRating) * order;
      }
      if (sortBy === 'email') {
        return a.email.localeCompare(b.email) * order;
      }
      if (sortBy === 'address') {
        return a.address.localeCompare(b.address) * order;
      }
      return a.name.localeCompare(b.name) * order;
    });

    return formattedStores;
  }
}

export const adminService = new AdminService();
