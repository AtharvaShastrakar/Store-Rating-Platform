import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import type { Store, User } from '../../types';
import { Modal } from '../../components/Modal';
import { StarRating } from '../../components/StarRating';
import {
  Search,
  Plus,
  ArrowUpDown,
  Store as StoreIcon,
  Mail,
  MapPin,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';

export const AdminStores: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [storeOwners, setStoreOwners] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [modalErrors, setModalErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stores', {
        params: { search, sortBy, sortOrder },
      });
      setStores(res.data.stores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const res = await api.get('/admin/users', { params: { role: 'STORE_OWNER' } });
      setStoreOwners(res.data.users);
    } catch (err) {
      console.error('Failed to fetch store owners:', err);
    }
  };

  useEffect(() => {
    fetchStores();
    fetchStoreOwners();
  }, [search, sortBy, sortOrder]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrors({});
    setSubmitting(true);

    try {
      await api.post('/admin/stores', newStore);
      setIsModalOpen(false);
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      setToastMsg('Store added successfully!');
      setTimeout(() => setToastMsg(null), 4000);
      fetchStores();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errObj: { [key: string]: string } = {};
        err.response.data.errors.forEach((e: any) => {
          errObj[e.field] = e.message;
        });
        setModalErrors(errObj);
      } else {
        setModalErrors({ general: 'Failed to create store.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <StoreIcon className="w-6 h-6 text-indigo-400" />
            Registered Stores Management
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            View all registered stores, check average ratings, search, and register new stores.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add New Store
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stores by Name, Email, Address..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-200 font-bold">{stores.length}</span> store listing(s)
        </div>
      </div>

      {/* Stores Table */}
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
                    <span>Store Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Store Email</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('address')}
                  className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Address</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4">Assigned Store Owner</th>
                <th
                  onClick={() => handleSort('overallRating')}
                  className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Overall Rating</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading store listings...
                  </td>
                </tr>
              ) : stores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No stores found matching your query.
                  </td>
                </tr>
              ) : (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100 flex items-center gap-2">
                      <StoreIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      {store.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {store.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={store.address}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {store.owner ? (
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                          <span>{store.owner.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={store.overallRating} size="sm" />
                        <span className="font-bold text-amber-400">{store.overallRating.toFixed(1)}</span>
                        <span className="text-xs text-slate-500">({store.totalRatings} ratings)</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Store Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Store">
        <form onSubmit={handleCreateStore} className="space-y-4">
          {modalErrors.general && (
            <p className="text-xs text-rose-400 p-3 bg-rose-950/40 rounded-xl border border-rose-800/50">
              {modalErrors.general}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Store Name (3-60 chars)
            </label>
            <input
              type="text"
              required
              value={newStore.name}
              onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              placeholder="e.g. Artisan Coffee Roasters"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {modalErrors.name && <p className="text-xs text-rose-400 mt-1">{modalErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Store Email
            </label>
            <input
              type="email"
              required
              value={newStore.email}
              onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
              placeholder="store@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {modalErrors.email && <p className="text-xs text-rose-400 mt-1">{modalErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Store Address (Max 400 chars)
            </label>
            <textarea
              required
              rows={2}
              value={newStore.address}
              onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
              placeholder="101 Commercial Parkway, San Jose, CA..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {modalErrors.address && <p className="text-xs text-rose-400 mt-1">{modalErrors.address}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Assign Store Owner (Optional)
            </label>
            <select
              value={newStore.ownerId}
              onChange={(e) => setNewStore({ ...newStore, ownerId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Store Owner Account --</option>
              {storeOwners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              {submitting ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
