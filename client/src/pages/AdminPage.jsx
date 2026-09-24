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
    let ignore = false;
    async function fetchData() {
      try {
        const [usersRes, statsRes] = await Promise.all([
          authApi.getAdminUsers(),
          authApi.getAdminStats(),
        ]);
        if (!ignore) {
          if (usersRes.success) setUsers(usersRes.users || []);
          if (statsRes.success) setStats(statsRes.stats || null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err.response?.data?.error?.message ||
              'Failed to load admin data. Ensure you have administrator authorization.'
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    fetchData();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-purple-950/15 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="glass-badge bg-purple-500/20 text-purple-300 border border-purple-500/30">
                System Administration
              </span>
              <span className="text-xs text-slate-400">Strict Backend Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Platform Administration Panel
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              Protected by requireRole(&quot;admin&quot;) middleware. Only verified administrators can access these endpoints.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            disabled={loading}
            className="glass-btn-secondary text-xs text-purple-300 border-purple-500/30 hover:bg-purple-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Admin Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Total Users</span>
              <Users className="w-5 h-5 text-primary-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Requesters</span>
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalRequesters}</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Providers</span>
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalProviders}</div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-white/10">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase">Admins</span>
              <ShieldAlert className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalAdmins}</div>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="glass-card rounded-3xl p-6 border border-white/15 overflow-hidden">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-400" />
          Registered Users Catalog
        </h2>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-2" />
            <p className="text-sm">Fetching verified user records from server...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Roles</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-300 font-bold text-xs flex items-center justify-center">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 text-xs font-mono">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r === 'admin'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : r === 'provider'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
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
