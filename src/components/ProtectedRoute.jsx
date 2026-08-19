import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — wraps a page component with authentication and role checks.
 *
 * Props:
 *   allowedRoles  — array of roles that can access this route (e.g. ['fpo', 'buyer'])
 *   children      — the page element to render when authorized
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B08] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#6F956B] animate-pulse" />
          <span className="font-mono text-xs text-[#9A9D91] tracking-widest uppercase">
            Verifying session…
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    const target = role === 'fpo' ? '/dashboard/fpo' : '/dashboard/buyer';
    return <Navigate to={target} replace />;
  }

  return children;
}
