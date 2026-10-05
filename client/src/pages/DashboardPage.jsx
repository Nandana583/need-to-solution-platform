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
  ArrowRight,
  Loader2,
  Clock,
  Layers,
  BookOpen,
  Activity,
  TrendingUp,
  CheckCircle2,
  Target,
  MapPin,
} from 'lucide-react';

/* ─── Skeleton card ─── */
const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/8">
    <div className="flex items-center justify-between mb-4">
      <div className="h-3 skeleton rounded-full w-20" />
      <div className="w-5 h-5 skeleton rounded-lg" />
    </div>
    <div className="h-8 skeleton rounded-lg w-14 mb-2" />
    <div className="h-2.5 skeleton rounded-full w-36" />
  </div>
);

/* ─── Metric card ─── */
const MetricCard = ({ to, label, value, description, icon: Icon, accentColor, loading }) => {
  const colorMap = {
    emerald: { icon: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', hover: 'hover:border-emerald-500/35' },
    teal:    { icon: 'text-teal-600 dark:text-teal-400',     bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    hover: 'hover:border-teal-500/35' },
    coral:   { icon: 'text-coral-600 dark:text-coral-400',   bg: 'bg-coral-500/10',   border: 'border-coral-500/20',   hover: 'hover:border-coral-500/35' },
    amber:   { icon: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   hover: 'hover:border-amber-500/35' },
  };
  const c = colorMap[accentColor] || colorMap.emerald;

  return (
    <Link
      to={to}
      className={`glass-card rounded-2xl p-5 border ${c.border} ${c.hover} transition-all duration-200 group flex flex-col`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
        <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
        {loading
          ? <span className="inline-block w-10 h-8 skeleton rounded-lg" />
          : value
        }
      </div>
      <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed">{description}</p>
      <div className={`mt-3 inline-flex items-center gap-1 text-[10px] font-semibold ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity`}>
        View details <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
};

/* ─── Quick link ─── */
const QuickLink = ({ to, icon: Icon, iconColor, label, badge }) => (
  <Link
    to={to}
    className="flex items-center justify-between p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] text-xs text-[var(--text-secondary)] transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/8"
  >
    <span className="flex items-center gap-3">
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconColor.replace('text-', 'bg-').split(' ')[0].replace('text-', 'bg-')}/12 shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
      </span>
      {label}
    </span>
    <span className="flex items-center gap-2">
      {badge && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
          {badge}
        </span>
      )}
      <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
    </span>
  </Link>
);

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    active:      { label: 'Active',      cls: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' },
    pending:     { label: 'Pending',     cls: 'bg-amber-500/12 text-amber-700 dark:text-amber-300' },
    completed:   { label: 'Completed',   cls: 'bg-charcoal-400/15 text-[var(--text-secondary)] dark:text-charcoal-300' },
    cancelled:   { label: 'Cancelled',   cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300' },
    ACCEPTED:    { label: 'Accepted',    cls: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' },
    PENDING:     { label: 'Pending',     cls: 'bg-amber-500/12 text-amber-700 dark:text-amber-300' },
    COMPLETED:   { label: 'Completed',   cls: 'bg-charcoal-400/15 text-[var(--text-secondary)] dark:text-charcoal-300' },
    IN_PROGRESS: { label: 'In Progress', cls: 'bg-teal-500/12 text-teal-700 dark:text-teal-300' },
    CANCELLED:   { label: 'Cancelled',   cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300' },
  };
  const s = map[status] || { label: status, cls: 'bg-charcoal-400/12 text-[var(--text-secondary)] dark:text-charcoal-300' };
  return (
    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
};

/* ─── Main Page ─── */
export const DashboardPage = () => {
  const { user, isProvider, isAdmin, becomeProvider } = useAuth();
  const [enablingProvider, setEnablingProvider] = useState(false);
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
        if (needsRes.success)  setNeeds(needsRes.needs || []);
        if (bookRes.success)   setBookings(bookRes.bookings || []);
        if (resRes.success)    setResources(resRes.resources || []);
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

  const activeNeeds    = needs.filter((n) => n.status === 'active' || n.status === 'pending').length;
  const activeBookings = bookings.filter((b) => b.status === 'ACCEPTED' || b.status === 'IN_PROGRESS').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* ══ WELCOME BANNER ══ */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/8 dark:border-white/10 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-72 h-72 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(16,185,129,0.10) 0%, transparent 65%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(20,184,166,0.06) 0%, transparent 65%)', filter: 'blur(40px)' }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                {greeting()} 👋
              </span>
              <div className="flex gap-1.5 flex-wrap">
                {user?.roles?.map((role) => (
                  <span
                    key={role}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      role === 'admin'
                        ? 'bg-terracotta-500/15 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-500/25'
                        : role === 'provider'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                        : 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/25'
                    }`}
                  >
                    {role.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1.5 max-w-md leading-relaxed">
              Your Solvenera central hub — all your needs, solutions, and resources in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/needs/new" className="glass-btn-primary text-sm">
              <PlusCircle className="w-4 h-4" />
              <span>Post a Need</span>
            </Link>
            <Link to="/profile" className="glass-btn-secondary text-sm">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ══ MAIN GRID ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Requester Hub (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Section heading */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Requester Hub
            </h2>
            <span className="text-xs text-[var(--text-muted)] hidden sm:block">Two-Phase Solution Center</span>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loadingMetrics ? (
              <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
            ) : (
              <>
                <MetricCard
                  to="/needs"
                  label="My Needs"
                  value={needs.length}
                  description={`${activeNeeds} active · ${needs.length - activeNeeds} resolved`}
                  icon={FileText}
                  accentColor="emerald"
                  loading={false}
                />
                <MetricCard
                  to="/bookings"
                  label="Bookings"
                  value={bookings.length}
                  description={`${activeBookings} in progress · ${completedCount} completed`}
                  icon={Calendar}
                  accentColor="teal"
                  loading={false}
                />
                <MetricCard
                  to="/shares"
                  label="Shares"
                  value={resources.length}
                  description="Resources you have listed"
                  icon={Share2}
                  accentColor="coral"
                  loading={false}
                />
              </>
            )}
          </div>

          {/* Post Need Banner */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-emerald-500/20 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.07) 0%, rgba(20,184,166,0.04) 50%, transparent 100%)',
            }} />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div>
                <span className="glass-badge bg-emerald-500/18 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 mb-2 inline-flex">
                  Need Something?
                </span>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Post a Service or Resource Need
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md leading-relaxed">
                  We search verified local providers first, then automatically find community alternatives.
                </p>
              </div>
              <Link to="/needs/new" className="glass-btn-primary py-2.5 px-5 text-sm whitespace-nowrap shrink-0">
                <PlusCircle className="w-4 h-4" />
                <span>Post Need</span>
              </Link>
            </div>
          </div>

          {/* Recent Needs Feed */}
          <div className="glass-card rounded-2xl p-5 sm:p-6 border border-black/5 dark:border-white/8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--text-muted)]" />
                Recent Needs
              </h3>
              {needs.length > 0 && (
                <Link to="/needs" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                  View all ({needs.length}) <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {loadingMetrics ? (
              <div className="space-y-2.5">
                {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl skeleton" />)}
              </div>
            ) : needs.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">No active requests yet.</p>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  Post your first need and we&apos;ll find you the right solution.
                </p>
                <Link to="/needs/new" className="glass-btn-primary text-xs inline-flex mt-4 px-5 py-2">
                  Post a Need
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {needs.slice(0, 4).map((n) => (
                  <Link
                    key={n._id}
                    to={`/needs/${n._id}`}
                    className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.05] dark:hover:bg-white/[0.05] border border-black/[0.03] dark:border-white/[0.03] hover:border-emerald-500/15 flex items-center justify-between transition-all group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {n.category?.name && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                            {n.category.name}
                          </span>
                        )}
                        <StatusBadge status={n.status} />
                      </div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{n.title}</h4>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activity Summary (only shown when data exists) */}
          {!loadingMetrics && (needs.length > 0 || bookings.length > 0) && (
            <div className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Activity Summary
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Needs Posted',   value: needs.length,    color: 'emerald' },
                  { label: 'Services Booked', value: bookings.length, color: 'teal' },
                  { label: 'Completed',       value: completedCount,  color: 'coral' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`text-center p-3 rounded-xl bg-${item.color}-500/8 border border-${item.color}-500/15`}
                  >
                    <div className={`text-2xl font-extrabold text-${item.color}-600 dark:text-${item.color}-400 tracking-tight`}>
                      {item.value}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-tight">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Status Cards */}
        <div className="space-y-5">

          {/* Provider Status Card */}
          <div className="glass-card rounded-3xl p-6 border border-black/8 dark:border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Provider Status
              </h2>
              {isProvider && (
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/18 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>

            {isProvider ? (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  Your account has provider capabilities. List services, share resources, and manage incoming requests.
                </p>
                <Link
                  to="/providers/manage"
                  className="w-full glass-btn-secondary text-xs justify-between text-emerald-700 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/8 flex"
                >
                  <span>Open Provider Hub</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  Want to offer repairs, tuition, books, or notes? Unlock provider capability on this same account — zero duplicate logins.
                </p>
                <button
                  onClick={handleEnableProvider}
                  disabled={enablingProvider}
                  className="w-full glass-btn-primary py-2.5 text-xs"
                >
                  {enablingProvider ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Activating…</span>
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

          {/* Quick Portals */}
          <div className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/8 space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">
              Quick Portals
            </h3>
            <QuickLink to="/providers"    icon={Briefcase} iconColor="text-emerald-600 dark:text-emerald-400" label="Browse Service Providers" />
            <QuickLink to="/resources"    icon={BookOpen}  iconColor="text-teal-600 dark:text-teal-400"       label="Community Resources & Books" />
            <QuickLink to="/resources/new" icon={Share2}   iconColor="text-coral-600 dark:text-coral-400"     label="Share a Book or Tool" />
            <QuickLink to="/needs"        icon={Activity}  iconColor="text-amber-600 dark:text-amber-400"     label="View All My Needs" />
          </div>

          {/* Admin Access (admin only) */}
          {isAdmin && (
            <div className="glass-card rounded-3xl p-6 border border-terracotta-500/25 bg-terracotta-500/4 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2.5">
                <ShieldAlert className="w-5 h-5 text-terracotta-600 dark:text-terracotta-400" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">Admin Access</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                Platform administration privileges to manage users, roles, categories, and system statistics.
              </p>
              <Link
                to="/admin"
                className="w-full glass-btn-secondary text-xs justify-between text-terracotta-700 dark:text-terracotta-300 border-terracotta-500/20 hover:bg-terracotta-500/10 flex"
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
