import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NotificationBell } from './NotificationBell';
import { ThemeToggle } from './ThemeToggle';
import { SolveneraLogo } from './SolveneraLogo';
import {
  User,
  ShieldAlert,
  Briefcase,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  Calendar,
  Share2,
  FileText,
  PlusCircle,
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isProvider, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path);

  const navLinkClass = (path) =>
    `px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
      isActive(path)
        ? 'bg-emerald-500/14 text-emerald-700 dark:text-emerald-300 font-semibold'
        : 'text-[var(--text-secondary)] hover:text-emerald-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
    }`;

  const mobileNavLinkClass = (path, special = false) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      special
        ? 'text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/10'
        : isActive(path)
        ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 font-semibold'
        : 'text-[var(--text-primary)] dark:text-[var(--text-secondary)] hover:bg-black/5 dark:hover:bg-white/8'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-nav transition-all duration-200" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">

          {/* ─── Brand Logo ─── */}
          <Link
            to="/"
            className="flex items-center gap-2 group py-1 shrink-0"
            title="Solvenera Home"
            aria-label="Solvenera — Home"
          >
            <SolveneraLogo className="w-8 h-8 sm:w-9 sm:h-9" showText={true} textClassName="text-lg sm:text-xl" />
          </Link>

          {/* ─── Desktop Navigation Links ─── */}
          <div className="hidden lg:flex items-center gap-0.5" role="menubar">
            <Link to="/" className={navLinkClass('/')} role="menuitem">
              Home
            </Link>

            <Link to="/providers" className={navLinkClass('/providers')} role="menuitem">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Providers
            </Link>

            <Link to="/resources" className={navLinkClass('/resources')} role="menuitem">
              <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Resources
            </Link>

            {isAuthenticated && (
              <>
                <Link to="/needs" className={navLinkClass('/needs')} role="menuitem">
                  <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  My Needs
                </Link>

                <Link to="/bookings" className={navLinkClass('/bookings')} role="menuitem">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Bookings
                </Link>

                <Link to="/shares" className={navLinkClass('/shares')} role="menuitem">
                  <Share2 className="w-3.5 h-3.5 text-coral-600 dark:text-coral-400" />
                  Shares
                </Link>

                <Link to="/dashboard" className={navLinkClass('/dashboard')} role="menuitem">
                  <LayoutDashboard className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Dashboard
                </Link>

                {isProvider && (
                  <Link
                    to="/providers/manage"
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isActive('/providers/manage')
                        ? 'bg-emerald-500/18 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/25'
                        : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent'
                    }`}
                    role="menuitem"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Provider Hub
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isActive('/admin')
                        ? 'bg-terracotta-500/18 text-terracotta-700 dark:text-terracotta-300 font-semibold border border-terracotta-500/25'
                        : 'text-terracotta-600 dark:text-terracotta-300 hover:bg-terracotta-500/10 border border-transparent'
                    }`}
                    role="menuitem"
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* ─── Desktop Action Center ─── */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {/* Post Need CTA */}
                <Link
                  to="/needs/new"
                  className="glass-btn-primary text-xs py-1.5 px-3.5"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Need</span>
                </Link>

                {/* Notification Bell */}
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    id="user-menu-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    aria-controls="user-dropdown-menu"
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-black/[0.04] dark:bg-white/5 hover:bg-black/[0.08] dark:hover:bg-white/10 border border-black/10 dark:border-white/10 transition-all duration-200 group"
                  >
                    {/* Avatar */}
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
                      aria-hidden="true"
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-[var(--text-primary)] leading-tight max-w-[80px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      id="user-dropdown-menu"
                      role="menu"
                      aria-labelledby="user-menu-btn"
                      className="absolute right-0 mt-2 w-60 glass-card-elevated rounded-2xl p-2 z-50 border border-black/10 dark:border-white/12 animate-scale-in"
                    >
                      {/* User info header */}
                      <div className="px-3 py-2.5 border-b border-black/5 dark:border-white/10 mb-1.5">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate mt-0.5">
                          {user?.email}
                        </p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {user?.roles?.map((role) => (
                            <span
                              key={role}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                role === 'admin'
                                  ? 'bg-terracotta-500/15 text-terracotta-700 dark:text-terracotta-300'
                                  : role === 'provider'
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
                              }`}
                            >
                              {role.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Menu items */}
                      {[
                        { to: '/profile',  icon: User,          label: 'My Profile',          iconClass: 'text-emerald-600 dark:text-emerald-400' },
                        { to: '/needs',    icon: FileText,      label: 'My Needs',             iconClass: 'text-amber-600 dark:text-amber-400' },
                        { to: '/bookings', icon: Calendar,      label: 'Service Bookings',     iconClass: 'text-teal-600 dark:text-teal-400' },
                        { to: '/shares',   icon: Share2,        label: 'Resource Shares',      iconClass: 'text-coral-600 dark:text-coral-400' },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:bg-emerald-500/8 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
                        >
                          <item.icon className={`w-4 h-4 ${item.iconClass}`} />
                          {item.label}
                        </Link>
                      ))}

                      {isProvider && (
                        <Link
                          to="/providers/manage"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors font-medium"
                        >
                          <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Provider Dashboard
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin"
                          role="menuitem"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-terracotta-700 dark:text-terracotta-300 hover:bg-terracotta-500/10 transition-colors font-medium"
                        >
                          <ShieldAlert className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400" />
                          Admin Panel
                        </Link>
                      )}

                      <div className="border-t border-black/5 dark:border-white/10 mt-1.5 pt-1.5">
                        <button
                          onClick={handleLogout}
                          role="menuitem"
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-600 dark:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-[var(--text-secondary)] dark:text-[var(--text-secondary)] hover:text-emerald-600 dark:hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="glass-btn-primary text-xs py-1.5 px-4"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* ─── Mobile: Theme + Bell + Hamburger ─── */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 transition-all"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5" aria-hidden="true" />
                : <Menu className="w-5 h-5" aria-hidden="true" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu ─── */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden glass-nav border-t border-black/5 dark:border-white/10 animate-fade-down"
          aria-label="Mobile navigation"
        >
          <div className="max-w-7xl mx-auto px-4 pt-3 pb-5 space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/')}>
              Home
            </Link>
            <Link to="/providers" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/providers')}>
              <Briefcase className="w-4 h-4 text-emerald-500" />
              Browse Providers
            </Link>
            <Link to="/resources" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/resources')}>
              <BookOpen className="w-4 h-4 text-teal-500" />
              Community Resources
            </Link>

            {isAuthenticated ? (
              <>
                <div className="pt-2 pb-1">
                  <div className="h-px bg-black/5 dark:bg-white/8" />
                </div>
                <Link to="/needs" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/needs')}>
                  <FileText className="w-4 h-4 text-amber-500" />
                  My Needs
                </Link>
                <Link to="/needs/new" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/needs/new', true)}>
                  <PlusCircle className="w-4 h-4" />
                  Post a Need
                </Link>
                <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/bookings')}>
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  Service Bookings
                </Link>
                <Link to="/shares" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/shares')}>
                  <Share2 className="w-4 h-4 text-coral-500" />
                  Resource Shares
                </Link>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 text-teal-500" />
                  Dashboard
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={mobileNavLinkClass('/profile')}>
                  <User className="w-4 h-4 text-emerald-500" />
                  My Profile
                </Link>

                {isProvider && (
                  <Link to="/providers/manage" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-all">
                    <Briefcase className="w-4 h-4" />
                    Provider Hub
                  </Link>
                )}

                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-terracotta-700 dark:text-terracotta-300 hover:bg-terracotta-500/10 transition-all">
                    <ShieldAlert className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}

                <div className="pt-2">
                  <div className="h-px bg-black/5 dark:bg-white/8 mb-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-300 bg-rose-500/8 border border-rose-500/18 hover:bg-rose-500/14 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-3 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-xl text-sm font-medium text-[var(--text-primary)] dark:text-[var(--text-secondary)] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/8 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center glass-btn-primary py-2.5 text-sm"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
