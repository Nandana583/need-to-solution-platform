import React, { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import {
  ShieldAlert,
  Users,
  Briefcase,
  Layers,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Calendar,
  BookOpen,
  Wrench,
} from 'lucide-react';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, statsRes] = await Promise.all([
        authApi.getAdminUsers(),
        authApi.getAdminStats(),
      ]);

      if (usersRes.success) {
        setUsers(usersRes.users || []);
      }
      if (statsRes.success) {
        setStats(statsRes.stats || null);
      }
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to load admin data. Ensure you have administrator authorization.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-terracotta-500/30 bg-terracotta-500/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="glass-badge bg-terracotta-500/20 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-500/30">
                System Administration
              </span>
              <span className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">Strict Backend Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Platform Administration Panel
            </h1>
            <p className="text-[var(--text-secondary)] dark:text-terracotta-200 text-sm mt-1">
              Protected by requireRole(&quot;admin&quot;) middleware. Only verified administrators can access these endpoints.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="glass-btn-secondary text-xs text-terracotta-700 dark:text-terracotta-300 border-terracotta-500/30 hover:bg-terracotta-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Comprehensive Platform Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Total Users</span>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalUsers || 0}</div>
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">{stats.totalProviders || 0} Providers</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Total Needs</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalNeeds || 0}</div>
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">{stats.activeNeeds || 0} Active</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Bookings</span>
            <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{stats.totalBookings || 0}</div>
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">{stats.completedBookings || 0} Completed</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Resources</span>
            <div className="text-2xl font-bold text-coral-600 dark:text-coral-400">{stats.totalResources || 0}</div>
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">Books & Notes</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Services</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.totalServices || 0}</div>
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">Listed Packages</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-black/5 dark:border-white/10">
            <span className="text-[11px] font-semibold uppercase text-[var(--text-muted)] dark:text-[var(--text-muted)] block mb-1">Categories</span>
            <div className="text-2xl font-bold text-terracotta-600 dark:text-terracotta-400">{stats.totalCategories || 0}</div>
            <p className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">Active Types</p>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="glass-card rounded-3xl p-6 border border-black/10 dark:border-white/15 overflow-hidden">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-terracotta-600 dark:text-terracotta-400" />
          Registered Users Catalog
        </h2>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-charcoal-400">
            <Loader2 className="w-8 h-8 animate-spin text-terracotta-600 dark:text-terracotta-400 mb-2" />
            <p className="text-sm">Fetching verified user records from server...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-[var(--text-muted)] dark:text-[var(--text-muted)] text-sm">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-black/[0.02] dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-primary)] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)] text-xs font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r === 'admin'
                                ? 'bg-terracotta-500/20 text-terracotta-700 dark:text-terracotta-300 border border-terracotta-500/30'
                                : r === 'provider'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-muted)] dark:text-[var(--text-muted)] text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
