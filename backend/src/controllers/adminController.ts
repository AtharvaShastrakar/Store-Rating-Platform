import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  validateUserPayload,
  validateStoreName,
  validateEmail,
  validateAddress,
} from '../utils/validation';
import { Role } from '@prisma/client';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalStores = await prisma.store.count();
    const totalRatings = await prisma.rating.count();

    return res.json({
      totalUsers,
      totalStores,
      totalRatings,
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, password, address, role } = req.body;

    const validationErrors = validateUserPayload({ name, email, password, address });
    if (!role || !Object.values(Role).includes(role as Role)) {
      validationErrors.push({
        field: 'role',
        message: 'Valid role is required (ADMIN, NORMAL_USER, STORE_OWNER).',
      });
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({
        errors: [{ field: 'email', message: 'Email is already registered.' }],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        address: address.trim(),
        role: role as Role,
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

    return res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createStore = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const errors: { field: string; message: string }[] = [];
    const nameErr = validateStoreName(name);
    if (nameErr) errors.push({ field: 'name', message: nameErr });

    const emailErr = validateEmail(email);
    if (emailErr) errors.push({ field: 'email', message: emailErr });

    const addrErr = validateAddress(address);
    if (addrErr) errors.push({ field: 'address', message: addrErr });

    if (ownerId && typeof ownerId === 'string') {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner || owner.role !== Role.STORE_OWNER) {
        errors.push({ field: 'ownerId', message: 'Assigned owner must be a valid STORE_OWNER user.' });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const existingStore = await prisma.store.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingStore) {
      return res.status(400).json({
        errors: [{ field: 'email', message: 'Store email already exists.' }],
      });
    }

    const store = await prisma.store.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerId: (ownerId && typeof ownerId === 'string') ? ownerId : null,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({
      message: 'Store created successfully',
      store,
    });
  } catch (error: any) {
    console.error('Error creating store:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, role, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where: any = {};

    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
      ];
    }

    const order = (sortOrder as string).toLowerCase() === 'desc' ? 'desc' : 'asc';
    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const orderByField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'name';

    const users = await prisma.user.findMany({
      where,
      orderBy: {
        [orderByField]: order,
      },
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
            ratings: {
              select: { value: true },
            },
          },
        },
      },
    });

    const formattedUsers = users.map((user) => {
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

    return res.json({ users: formattedUsers });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

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
            ratings: {
              select: { value: true },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let ratingInfo: { averageRating: number | null; totalRatings: number; stores: any[] } | null = null;
    if (user.role === Role.STORE_OWNER && user.ownedStores) {
      let totalVal = 0;
      let count = 0;
      const storesFormatted = user.ownedStores.map((store) => {
        const storeSum = store.ratings.reduce((acc: number, curr: { value: number }) => acc + curr.value, 0);
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

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        createdAt: user.createdAt,
        storeRating: ratingInfo,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getStores = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const where: any = {};
    if (search && typeof search === 'string' && search.trim() !== '') {
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
        owner: {
          select: { id: true, name: true, email: true },
        },
        ratings: {
          select: { value: true },
        },
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

    const order = (sortOrder as string).toLowerCase() === 'desc' ? -1 : 1;
    const field = sortBy as string;

    formattedStores.sort((a: any, b: any) => {
      if (field === 'overallRating' || field === 'rating') {
        return (a.overallRating - b.overallRating) * order;
      }
      if (field === 'email') {
        return a.email.localeCompare(b.email) * order;
      }
      if (field === 'address') {
        return a.address.localeCompare(b.address) * order;
      }
      return a.name.localeCompare(b.name) * order;
    });

    return res.json({ stores: formattedStores });
  } catch (error: any) {
    console.error('Error fetching stores for admin:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
