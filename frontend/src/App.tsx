import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { UpdatePassword } from './pages/UpdatePassword';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminStores } from './pages/admin/AdminStores';
import { AdminUsers } from './pages/admin/AdminUsers';
import { UserStoresList } from './pages/user/UserStoresList';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';

const HomeRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'STORE_OWNER') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/user/stores" replace />;
};

export const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Authenticated Routes (All Roles) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/update-password" element={<UpdatePassword />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/stores" element={<AdminStores />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* Normal User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['NORMAL_USER']} />}>
            <Route path="/user/stores" element={<UserStoresList />} />
          </Route>

          {/* Store Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
