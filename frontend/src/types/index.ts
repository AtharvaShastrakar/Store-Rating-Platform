export type UserRole = 'ADMIN' | 'NORMAL_USER' | 'STORE_OWNER';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt?: string;
  storeRating?: {
    averageRating: number | null;
    totalRatings: number;
    stores?: Array<{
      id: string;
      name: string;
      email: string;
      address: string;
      averageRating: number | null;
      totalRatings: number;
    }>;
  } | null;
  ownedStores?: Array<{ id: string; name: string }>;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  overallRating: number;
  totalRatings: number;
  userSubmittedRating?: number | null;
  ratingId?: string | null;
  owner?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt?: string;
}

export interface Rating {
  id: string;
  value: number;
  userId: string;
  storeId: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    address: string;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

export interface OwnerDashboardData {
  hasStore: boolean;
  message?: string;
  stores?: Array<{
    storeId: string;
    storeName: string;
    storeEmail: string;
    storeAddress: string;
    averageRating: number;
    totalRatings: number;
    ratingsList: Array<{
      ratingId: string;
      user: {
        id: string;
        name: string;
        email: string;
        address: string;
      };
      rating: number;
      createdAt: string;
    }>;
  }>;
}
