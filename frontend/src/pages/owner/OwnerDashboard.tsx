import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { OwnerDashboardData } from '../../types';
import { StarRating } from '../../components/StarRating';
import {
  Store,
  Star,
  Users,
  Search,
  ArrowUpDown,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/owner/dashboard', {
        params: { search, sortBy, sortOrder },
      });
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading store dashboard...
      </div>
    );
  }

  if (!data || !data.hasStore || !data.stores || data.stores.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">No Store Assigned</h2>
          <p className="text-slate-400 mt-2 max-w-md mx-auto text-sm">
            There are currently no stores assigned to your Store Owner account. Please contact a System Administrator to assign your store.
          </p>
        </div>
      </div>
    );
  }

  const currentStore = data.stores[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Store Header Banner */}
      <div className="bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-900 border border-blue-800/30 rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-widest mb-2">
              <Store className="w-4 h-4" />
              Store Owner Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100">{currentStore.storeName}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                {currentStore.storeEmail}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {currentStore.storeAddress}
              </span>
            </div>
          </div>

          {/* Stat Pill */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex items-center gap-6 shadow-inner">
            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Average Rating
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-black text-amber-400">
                  {currentStore.averageRating > 0 ? currentStore.averageRating.toFixed(1) : '0.0'}
                </span>
                <span className="text-xs text-slate-500">/ 5</span>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800"></div>

            <div>
              <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Ratings
              </span>
              <span className="text-2xl font-black text-slate-100 mt-1 block">
                {currentStore.totalRatings}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Breakdown Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Submitted Customer Ratings
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customers who have rated your store.
            </p>
          </div>

          {/* Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user ratings by Name or Email..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Ratings Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer Name</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('email')}
                    className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Customer Email</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('rating')}
                    className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Submitted Rating</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date & Time</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {currentStore.ratingsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No ratings submitted yet for this store.
                    </td>
                  </tr>
                ) : (
                  currentStore.ratingsList.map((item) => (
                    <tr key={item.ratingId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-100">{item.user.name}</td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {item.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StarRating rating={item.rating} size="sm" />
                          <span className="font-bold text-amber-400">{item.rating} ★</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
