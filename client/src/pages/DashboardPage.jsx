import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { needsApi } from '../api/needsApi';
import { bookingsApi } from '../api/bookingsApi';
import { resourcesApi } from '../api/resourcesApi';
import {
  Sparkles,
  PlusCircle,
  FileText,
  Calendar,
  Share2,
  Briefcase,
  ShieldAlert,
  User,
  CheckCircle,
  ArrowRight,
  Loader2,
  Clock,
  Layers,
  MapPin,
  BookOpen,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isProvider, isAdmin, becomeProvider } = useAuth();
  const [enablingProvider, setEnablingProvider] = useState(false);

  // Live Metrics & Activity State
  const [needs, setNeeds] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [needsRes, bookRes, resRes] = await Promise.all([
          needsApi.getMyNeeds(),
          bookingsApi.getMyRequests(),
          resourcesApi.getMyResources(),
        ]);

        if (needsRes.success) setNeeds(needsRes.needs || []);
        if (bookRes.success) setBookings(bookRes.bookings || []);
        if (resRes.success) setResources(resRes.resources || []);
      } catch {
        // ignore
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleEnableProvider = async () => {
    setEnablingProvider(true);
    await becomeProvider();
    setEnablingProvider(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 relative overflow-hidden mb-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-400">
                Active Session
              </span>
              <div className="flex gap-1.5">
                {user?.roles?.map((role) => (
                  <span
                    key={role}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      role === 'admin'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : role === 'provider'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                    }`}
                  >
                    {role.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Your Need-to-Solution central dashboard and request tracking hub.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/needs/new" className="glass-btn-primary text-sm flex items-center gap-1.5 shadow-md">
              <PlusCircle className="w-4 h-4" />
              <span>Post a Need</span>
            </Link>
            <Link to="/profile" className="glass-btn-secondary text-sm flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Requester Overview & Provider Capabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Requester Capabilities & Activity (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary-400" />
              Requester Hub
            </h2>
            <span className="text-xs text-slate-400">Two-Phase Solution Center</span>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/needs" className="glass-card rounded-2xl p-5 border border-white/10 hover:border-primary-500/30 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase">My Needs</span>
                <FileText className="w-4 h-4 text-primary-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {loadingMetrics ? '...' : needs.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Active requests posted</p>
            </Link>

            <Link to="/bookings" className="glass-card rounded-2xl p-5 border border-white/10 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase">My Bookings</span>
                <Calendar className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {loadingMetrics ? '...' : bookings.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Confirmed service bookings</p>
            </Link>

            <Link to="/shares" className="glass-card rounded-2xl p-5 border border-white/10 hover:border-accent-500/30 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-semibold uppercase">Resource Shares</span>
                <Share2 className="w-4 h-4 text-accent-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {loadingMetrics ? '...' : resources.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Books & tools listed</p>
            </Link>
          </div>

          {/* Post Need Action Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden bg-gradient-to-r from-primary-950/40 to-slate-900/40">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="glass-badge bg-primary-500/20 text-primary-300 mb-2">
                  Need Something?
                </span>
                <h3 className="text-lg font-bold text-white">Post a Service or Resource Need</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Tell us what you need. We search verified local providers first, then automatically find community alternatives if needed.
                </p>
              </div>
              <Link
                to="/needs/new"
                className="glass-btn-primary py-2.5 px-4 text-sm whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Need</span>
              </Link>
            </div>
          </div>

          {/* Recent Needs Feed */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                Recent Posted Needs
              </h3>
              {needs.length > 0 && (
                <Link to="/needs" className="text-xs text-primary-400 hover:underline">
                  View all ({needs.length})
                </Link>
              )}
            </div>

            {needs.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <p className="text-sm">No recent requests or needs.</p>
                <p className="text-xs text-slate-500 mt-1">
                  When you post a need or book a service, live updates appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {needs.slice(0, 3).map((n) => (
                  <Link
                    key={n._id}
                    to={`/needs/${n._id}`}
                    className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between transition-all block"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-500/20 text-primary-300">
                          {n.category?.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {n.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Provider & Admin Capabilities */}
        <div className="space-y-6">
          {/* Provider Capability Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/15 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" />
                Provider Status
              </h2>
              {isProvider && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ENABLED
                </span>
              )}
            </div>

            {isProvider ? (
              <div>
                <p className="text-xs text-slate-300 mb-4">
                  Your account has provider capabilities unlocked. You can list services, share textbooks, and manage incoming requests.
                </p>
                <Link
                  to="/providers/manage"
                  className="w-full glass-btn-secondary text-sm justify-between text-emerald-300 hover:text-emerald-200 border-emerald-500/30"
                >
                  <span>Open Provider Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-slate-300 mb-4">
                  Want to offer fan repairs, tuition, books, or notes? Unlock provider capability on this same account with zero duplicate logins.
                </p>
                <button
                  onClick={handleEnableProvider}
                  disabled={enablingProvider}
                  className="w-full glass-btn-primary py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/20"
                >
                  {enablingProvider ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Unlock Provider Capability</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Quick Hub Links */}
          <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Quick Portals
            </h3>
            <Link
              to="/providers"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                Browse Service Providers
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/resources"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-400" />
                Community Resources & Books
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              to="/resources/new"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200"
            >
              <span className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-accent-400" />
                Share a Book or Tool
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>

          {/* Admin Quick Link (if Admin) */}
          {isAdmin && (
            <div className="glass-card rounded-3xl p-6 border border-purple-500/30 relative overflow-hidden bg-purple-950/20">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Administrator Access</h3>
              </div>
              <p className="text-xs text-purple-200 mb-4">
                You have platform administration privileges to manage users, roles, and review system stats.
              </p>
              <Link
                to="/admin"
                className="w-full glass-btn-secondary text-sm justify-between text-purple-300 border-purple-500/30 hover:bg-purple-500/10"
              >
                <span>Access Admin Panel</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
