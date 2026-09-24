import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Sparkles, ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Loading State while restoring session silently
  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center shadow-2xl shadow-primary-500/40 animate-pulse">
            <Sparkles className="w-8 h-8 text-white animate-spin" />
          </div>
          <div className="absolute -inset-2 rounded-3xl bg-primary-500/20 blur-xl -z-10 animate-pulse"></div>
        </div>
        <p className="mt-6 text-sm font-medium text-slate-300 tracking-wide">
          Verifying secure session...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role Authorization check
  if (requiredRole && (!user?.roles || !user.roles.includes(requiredRole))) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 glass-card rounded-3xl text-center border border-rose-500/20">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-slate-300 text-sm mb-6">
          You do not have the required <span className="font-semibold text-rose-400 font-mono">[{requiredRole}]</span> permission to view this section.
        </p>
        <Navigate to="/dashboard" replace />
      </div>
    );
  }

  return children;
};
