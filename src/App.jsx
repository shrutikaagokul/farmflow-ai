import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TryDemo from './pages/TryDemo';
import Login from './pages/Login';
import BuyerDashboard from './pages/BuyerDashboard';
import Profile from './pages/Profile';

/**
 * RootRoute Component
 * First screen users see upon opening website (/):
 * - If not authenticated: renders Login page
 * - If authenticated / demo session active: redirects to Landing Page (/home) or Buyer Dashboard (/dashboard/buyer)
 */
function RootRoute() {
  const { isAuthenticated, loading, role } = useAuth();
  const demoRole = localStorage.getItem('farmflow_demo_role');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B08] flex items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-xs text-[#9A9D91]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6F956B] animate-pulse" />
          <span>VERIFYING FARMFLOW SESSION…</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated || demoRole) {
    if (role === 'buyer' || demoRole === 'buyer') {
      return <Navigate to="/dashboard/buyer" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return <Login />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Opening Root Route — Login Page by Default */}
          <Route path="/" element={<RootRoute />} />

          {/* Landing Page */}
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/try-demo" element={<TryDemo />} />

          {/* Protected FPO routes */}
          <Route
            path="/dashboard/fpo"
            element={
              <ProtectedRoute allowedRoles={['fpo']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Buyer routes */}
          <Route
            path="/dashboard/buyer"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute allowedRoles={['buyer']}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Profile (any role) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['fpo', 'buyer']}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
