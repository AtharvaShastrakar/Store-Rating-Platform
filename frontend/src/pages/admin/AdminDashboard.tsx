import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { DashboardStats } from '../../types';
import { Users, Store, Star, Plus, ShieldCheck, ArrowRight } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err: any) {
        console.error('Failed to load dashboard stats:', err);
        setError('Failed to load administrator metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-2">
            <ShieldCheck className="w-4 h-4" />
            System Administrator Control Center
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Platform Analytics & Management</h1>
          <p className="text-slate-400 mt-1 max-w-xl text-sm">
            Monitor registered platform users, store listings, overall ratings activity, and add new system entities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/stores?action=new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Store
          </Link>
          <Link
            to="/admin/users?action=new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Users */}
          <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-black text-slate-100">{stats?.totalUsers ?? 0}</span>
              <p className="text-xs text-slate-400 mt-1">Registered users across all roles</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium">
              <Link to="/admin/users" className="hover:underline flex items-center gap-1">
                View & filter user accounts <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Total Stores */}
          <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Stores</span>
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Store className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-black text-slate-100">{stats?.totalStores ?? 0}</span>
              <p className="text-xs text-slate-400 mt-1">Active stores on the platform</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
              <Link to="/admin/stores" className="hover:underline flex items-center gap-1">
                View & filter store listings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Total Submitted Ratings */}
          <div className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-lg hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Submitted Ratings</span>
              <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 fill-amber-400/20" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-4xl font-black text-slate-100">{stats?.totalRatings ?? 0}</span>
              <p className="text-xs text-slate-400 mt-1">Total user store ratings submitted</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium">
              <span>Ratings range from 1 to 5 stars</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
