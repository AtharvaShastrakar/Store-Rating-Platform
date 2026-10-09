import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Store } from '../../types';
import { StarRating } from '../../components/StarRating';
import {
  Store as StoreIcon,
  Search,
  MapPin,
  Mail,
  ArrowUpDown,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const UserStoresList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [ratingUpdatingId, setRatingUpdatingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores', {
        params: { search, sortBy, sortOrder },
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch store listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [search, sortBy, sortOrder]);

  const handleRatingSubmit = async (storeId: string, ratingValue: number) => {
    setRatingUpdatingId(storeId);
    try {
      await api.post('/ratings', { storeId, rating: ratingValue });
      setToastMsg(`Rating (${ratingValue} ★) saved successfully!`);
      setTimeout(() => setToastMsg(null), 3000);
      fetchStores();
    } catch (err: any) {
      console.error('Failed to submit rating:', err);
    } finally {
      setRatingUpdatingId(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/30 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest mb-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Discover & Rate Registered Stores
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">Explore Stores Platform</h1>
          <p className="text-slate-400 mt-1 max-w-xl text-sm">
            Search for registered stores by Name and Address, view overall community ratings, and submit or modify your star rating (1 to 5).
          </p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-sm flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Search & Sort Controls */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by Name or Address..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort By:</span>
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-colors ${
              sortBy === 'name'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Name <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleSort('overallRating')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-colors ${
              sortBy === 'overallRating'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Overall Rating <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleSort('myRating')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-colors ${
              sortBy === 'myRating'
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            My Rating <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Stores List Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-52 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
          No stores found matching "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-slate-900 border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/40 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition-transform">
                      <StoreIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{store.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        <span>{store.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{store.address}</span>
                </div>
              </div>

              {/* Ratings Section */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4">
                {/* Overall Community Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Overall Rating
                  </span>
                  <div className="flex items-center gap-2">
                    <StarRating rating={store.overallRating} size="sm" />
                    <span className="font-extrabold text-amber-400 text-sm">
                      {store.overallRating > 0 ? store.overallRating.toFixed(1) : 'Unrated'}
                    </span>
                    <span className="text-xs text-slate-500">({store.totalRatings} ratings)</span>
                  </div>
                </div>

                {/* User's Submitted Rating Control */}
                <div className="bg-indigo-950/20 border border-indigo-900/30 p-3.5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-semibold text-slate-200">
                      {store.userSubmittedRating ? 'Your Rating' : 'Rate This Store'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {store.userSubmittedRating
                        ? 'Click any star to modify rating'
                        : 'Select 1 to 5 stars to submit'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ratingUpdatingId === store.id ? (
                      <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <StarRating
                        rating={store.userSubmittedRating || 0}
                        interactive={true}
                        size="md"
                        onChange={(newRating) => handleRatingSubmit(store.id, newRating)}
                      />
                    )}
                    {store.userSubmittedRating && (
                      <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border border-amber-800/40">
                        {store.userSubmittedRating} ★
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
