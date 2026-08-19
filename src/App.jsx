import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import TryDemo from './pages/TryDemo';
import Login from './pages/Login';
import BuyerDashboard from './pages/BuyerDashboard';
import Profile from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes — no authentication required */}
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/try-demo" element={<TryDemo />} />
          <Route path="/login" element={<Login />} />

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
