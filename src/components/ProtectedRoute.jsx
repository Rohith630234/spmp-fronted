import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * Route Guard Component.
 * Restricts access to authenticated users and optionally filters by allowed roles.
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, preserving previous location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Role not authorized, redirect to main dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
