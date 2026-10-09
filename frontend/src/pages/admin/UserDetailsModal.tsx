import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { User } from '../../types';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { StarRating } from '../../components/StarRating';
import { Mail, MapPin, Store, Star, Calendar } from 'lucide-react';

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId && isOpen) {
      const fetchUserDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await api.get(`/admin/users/${userId}`);
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to fetch user details:', err);
          setError('Failed to fetch user details');
        } finally {
          setLoading(false);
        }
      };
      fetchUserDetails();
    }
  }, [userId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Account Details" maxWidth="lg">
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading user details...
        </div>
      ) : error || !user ? (
        <div className="py-6 text-center text-rose-400">{error || 'User details not found'}</div>
      ) : (
        <div className="space-y-6">
          {/* User Profile Card Header */}
          <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 shrink-0 font-bold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-100">{user.name}</h4>
                <Badge role={user.role} />
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          {/* User Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                Address
              </div>
              <p className="text-sm text-slate-200">{user.address}</p>
            </div>

            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Registered On
              </div>
              <p className="text-sm text-slate-200">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Special Store Owner Rating Display Section */}
          {user.role === 'STORE_OWNER' && (
            <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-800/40 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
                  <Store className="w-4 h-4 text-blue-400" />
                  Store Owner Rating Details
                </div>
                {user.storeRating?.averageRating !== null && user.storeRating?.averageRating !== undefined && (
                  <span className="text-xs px-2.5 py-1 bg-amber-950/80 border border-amber-800/50 text-amber-300 rounded-full font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    Overall Store Rating: {user.storeRating.averageRating} / 5
                  </span>
                )}
              </div>

              {user.storeRating?.stores && user.storeRating.stores.length > 0 ? (
                <div className="space-y-3">
                  {user.storeRating.stores.map((s) => (
                    <div
                      key={s.id}
                      className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <h5 className="font-semibold text-sm text-slate-200">{s.name}</h5>
                        <p className="text-xs text-slate-400">{s.address}</p>
                      </div>
                      <div className="text-right">
                        {s.averageRating !== null ? (
                          <div className="flex items-center gap-1.5">
                            <StarRating rating={s.averageRating} size="sm" />
                            <span className="font-bold text-amber-400 text-sm">{s.averageRating}</span>
                            <span className="text-xs text-slate-500">({s.totalRatings} ratings)</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">No ratings yet</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No store assigned to this store owner yet.</p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
