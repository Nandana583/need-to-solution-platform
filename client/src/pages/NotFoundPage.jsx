import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white tracking-tight">404</h1>
      <p className="text-lg font-semibold text-slate-200 mt-1">Page Not Found</p>
      <p className="text-slate-400 text-sm mt-2 max-w-sm">
        The page you are looking for does not exist or may have been moved.
      </p>
      <Link to="/" className="glass-btn-primary mt-6 text-sm">
        <Home className="w-4 h-4" />
        <span>Return Home</span>
      </Link>
    </div>
  );
};
