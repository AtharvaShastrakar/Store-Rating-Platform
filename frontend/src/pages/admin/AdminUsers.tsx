import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import type { User, UserRole } from '../../types';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { UserDetailsModal } from './UserDetailsModal';
import {
  Users as UsersIcon,
  Search,
  Plus,
  ArrowUpDown,
  Mail,
  MapPin,
  Eye,
  CheckCircle2,
  User as SingleUserIcon,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'NORMAL_USER' as UserRole,
  });
  const [addErrors, setAddErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // View User Details Modal State
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', {
        params: { search, role: roleFilter, sortBy, sortOrder },
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setIsAddModalOpen(true);
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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrors({});

    // Client side strict validation checks
    const errors: { [key: string]: string } = {};
    if (newUser.name.trim().length < 20 || newUser.name.trim().length > 60) {
      errors.name = 'Name must be between 20 and 60 characters.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email.trim())) {
      errors.email = 'Valid email address is required.';
    }
    if (newUser.address.trim().length === 0 || newUser.address.trim().length > 400) {
      errors.address = 'Address is required (max 400 characters).';
    }
    const pwd = newUser.password;
    if (pwd.length < 8 || pwd.length > 16 || !/[A-Z]/.test(pwd) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.password = 'Password must be 8-16 chars with at least 1 uppercase & 1 special character.';
    }

    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/admin/users', newUser);
      setIsAddModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'NORMAL_USER',
      });
      setToastMsg('User created successfully!');
      setTimeout(() => setToastMsg(null), 4000);
      fetchUsers();
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errObj: { [key: string]: string } = {};
        err.response.data.errors.forEach((e: any) => {
          errObj[e.field] = e.message;
        });
        setAddErrors(errObj);
      } else {
        setAddErrors({ general: 'Failed to create user.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openUserDetails = (id: string) => {
    setSelectedUserId(id);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 text-indigo-400" />
            User Accounts Directory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage system administrators, normal users, and store owners.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {toastMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter users by Name, Email, Address..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Role Filter Dropdown */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">System Admin</option>
            <option value="NORMAL_USER">Normal User</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-200 font-bold">{users.length}</span> user account(s)
        </div>
      </div>

      {/* Users Table */}
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
                    <span>Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email</span>
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
                <th
                  onClick={() => handleSort('role')}
                  className="px-6 py-4 cursor-pointer hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading user listings...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users match your specified filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-100 flex items-center gap-2">
                      <SingleUserIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-xs truncate" title={user.address}>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{user.address}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge role={user.role} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openUserDetails(user.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User Account">
        <form onSubmit={handleCreateUser} className="space-y-4">
          {addErrors.general && (
            <p className="text-xs text-rose-400 p-3 bg-rose-950/40 rounded-xl border border-rose-800/50">
              {addErrors.general}
            </p>
          )}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name (Min 20, Max 60 chars)
              </label>
              <span className="text-xs text-slate-400">{newUser.name.length}/60</span>
            </div>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Johnathan Alexander StoreOwner"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {addErrors.name && <p className="text-xs text-rose-400 mt-1">{addErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="user@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {addErrors.email && <p className="text-xs text-rose-400 mt-1">{addErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Password (8-16 chars, 1 uppercase, 1 special)
            </label>
            <input
              type="password"
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {addErrors.password && <p className="text-xs text-rose-400 mt-1">{addErrors.password}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Address (Max 400 chars)
              </label>
              <span className="text-xs text-slate-400">{newUser.address.length}/400</span>
            </div>
            <textarea
              required
              rows={2}
              value={newUser.address}
              onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
              placeholder="456 Silicon Way, San Jose, CA..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            {addErrors.address && <p className="text-xs text-rose-400 mt-1">{addErrors.address}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              User Role
            </label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="NORMAL_USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};
