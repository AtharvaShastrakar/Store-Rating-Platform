import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Badge } from './Badge';
import {
  Store,
  LayoutDashboard,
  Users,
  KeyRound,
  LogOut,
  ShoppingBag,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-indigo-400 hover:text-indigo-300 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Store className="w-5 h-5" />
              </div>
              <span>StoreRatings</span>
            </Link>

            {/* Role Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/admin/dashboard')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/stores"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/admin/stores')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Stores
                  </Link>
                  <Link
                    to="/admin/users"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/admin/users')
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                </>
              )}

              {user.role === 'NORMAL_USER' && (
                <Link
                  to="/user/stores"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/user/stores')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Explore Stores
                </Link>
              )}

              {user.role === 'STORE_OWNER' && (
                <Link
                  to="/owner/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/owner/dashboard')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Store Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                <Badge role={user.role} />
              </div>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/update-password"
                title="Update Password"
                className={`p-2 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors ${
                  isActive('/update-password') ? 'bg-slate-800 text-indigo-400' : ''
                }`}
              >
                <KeyRound className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setShowConfirmLogout(true)}
                title="Log Out"
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-100">Confirm Log Out</h3>
            <p className="text-sm text-slate-400 mt-2">Are you sure you want to log out of your session?</p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
