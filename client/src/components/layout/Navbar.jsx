import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import {
  Sparkles,
  User,
  ShieldAlert,
  Briefcase,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Layers,
  ChevronDown,
  BookOpen,
  Calendar,
  Share2,
  FileText,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isProvider, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white animate-pulse-slow" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                NeedToSolution
              </span>
              <span className="hidden sm:inline-block text-[10px] text-primary-400 font-medium px-1.5 py-0.5 rounded bg-primary-500/10 border border-primary-500/20 ml-2">
                Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive('/')
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>

            <Link
              to="/providers"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                isActive('/providers')
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Providers
            </Link>

            <Link
              to="/resources"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                isActive('/resources')
                  ? 'bg-white/10 text-white shadow-inner'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-primary-400" />
              Resources
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/needs"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                    isActive('/needs')
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  My Needs
                </Link>

                <Link
                  to="/bookings"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                    isActive('/bookings')
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  Bookings
                </Link>

                <Link
                  to="/shares"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                    isActive('/shares')
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Share2 className="w-3.5 h-3.5 text-accent-400" />
                  Shares
                </Link>

                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                    isActive('/dashboard')
                      ? 'bg-white/10 text-white shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary-400" />
                  Dashboard
                </Link>

                {isProvider && (
                  <Link
                    to="/providers/manage"
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                      isActive('/providers/manage')
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                    Provider Hub
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1 ${
                      isActive('/admin')
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-300 hover:text-purple-300 hover:bg-purple-500/10'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Auth Action Center */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* Real-time Notification Bell */}
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-white leading-tight">
                        {user?.name?.split(' ')[0]}
                      </p>
                    </div>
                    <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-card rounded-2xl p-2 shadow-2xl z-50 border border-white/15 animate-fade-in">
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <User className="w-4 h-4 text-primary-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/needs"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-indigo-400" />
                        My Needs Tracker
                      </Link>

                      <Link
                        to="/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-emerald-400" />
                        Service Bookings
                      </Link>

                      <Link
                        to="/shares"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-accent-400" />
                        Resource Shares
                      </Link>

                      {isProvider && (
                        <Link
                          to="/providers/manage"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-emerald-400" />
                          Provider Dashboard
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-purple-300 hover:bg-purple-500/10 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-purple-400" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-white/10 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="glass-btn-primary text-xs py-1.5 px-3.5 shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-nav border-t border-white/10 px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Home
          </Link>
          <Link
            to="/providers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Browse Providers
          </Link>
          <Link
            to="/resources"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
          >
            Community Resources
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/needs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                My Needs
              </Link>
              <Link
                to="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Service Bookings
              </Link>
              <Link
                to="/shares"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Resource Shares
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                My Profile
              </Link>
              {isProvider && (
                <Link
                  to="/providers/manage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-emerald-300 hover:bg-emerald-500/10"
                >
                  Provider Hub
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-medium text-purple-300 hover:bg-purple-500/10"
                >
                  Admin Panel
                </Link>
              )}
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-rose-300 bg-rose-500/10 border border-rose-500/20"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 rounded-xl text-sm font-medium text-slate-200 bg-white/5 border border-white/10"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center glass-btn-primary py-2 text-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
