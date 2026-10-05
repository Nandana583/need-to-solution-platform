import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { needsApi } from '../api/needsApi';
import {
  FileText,
  PlusCircle,
  Clock,
  MapPin,
  ArrowRight,
  Loader2,
  Target,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ─── Status badge helper ─── */
const NeedStatusBadge = ({ status }) => {
  const s = status?.toLowerCase();
  const config = {
    active:    { label: 'Active',    cls: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300 border-emerald-500/25' },
    pending:   { label: 'Pending',   cls: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/25' },
    completed: { label: 'Completed', cls: 'bg-charcoal-400/15 text-[var(--text-secondary)] dark:text-charcoal-300 border-charcoal-400/20' },
    cancelled: { label: 'Cancelled', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/25' },
  };
  const c = config[s] || { label: status, cls: 'bg-charcoal-400/10 text-[var(--text-muted)] border-charcoal-400/20' };
  return (
    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${c.cls}`}>
      {c.label}
    </span>
  );
};

export const MyNeedsPage = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const res = await needsApi.getMyNeeds();
        if (res.success) setNeeds(res.needs || []);
      } catch {
        toast.error('Failed to load your needs');
      } finally {
        setLoading(false);
      }
    };
    fetchNeeds();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="section-label">My Needs</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight mt-1">
            Posted Needs &amp; Requests
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1.5">
            Track your service requests, study material needs, and matched solutions.
          </p>
        </div>
        <Link to="/needs/new" className="glass-btn-primary text-sm shrink-0">
          <PlusCircle className="w-4 h-4" />
          <span>Post a New Need</span>
        </Link>
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-6 border border-black/5 dark:border-white/8 animate-pulse space-y-3">
              <div className="flex gap-2">
                <div className="h-5 skeleton rounded-full w-20" />
                <div className="h-5 skeleton rounded-full w-16 ml-auto" />
              </div>
              <div className="h-5 skeleton rounded-lg w-3/4" />
              <div className="h-3 skeleton rounded-full w-full" />
              <div className="h-3 skeleton rounded-full w-2/3" />
              <div className="h-9 skeleton rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : needs.length === 0 ? (
        <div className="glass-card rounded-3xl p-14 text-center border border-black/8 dark:border-white/10 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/22 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Needs Posted Yet</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed max-w-xs mx-auto">
            Post a need when you require a repair, tuition, study materials, or peer assistance. We find matches instantly.
          </p>
          <Link to="/needs/new" className="glass-btn-primary text-sm inline-flex">
            <PlusCircle className="w-4 h-4" />
            Post Your First Need
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {needs.map((need) => (
            <div
              key={need._id}
              className="glass-card rounded-2xl p-6 border border-black/8 dark:border-white/10 hover:border-emerald-500/28 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between group"
            >
              {/* Top: category + status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  {need.category?.name && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                      {need.category.name}
                    </span>
                  )}
                  <NeedStatusBadge status={need.status} />
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {need.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                  {need.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] mb-4 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(need.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {need.locationLabel && (
                    <span className="flex items-center gap-1 truncate max-w-[130px]">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{need.locationLabel}</span>
                    </span>
                  )}
                </div>

                {/* Match summary */}
                <div className="p-3 rounded-xl bg-black/[0.025] dark:bg-white/[0.03] border border-black/[0.04] dark:border-white/[0.04] text-[11px] flex items-center justify-between mb-4">
                  <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <Target className="w-3.5 h-3.5 text-emerald-500" />
                    Matches
                  </span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {need.matchedProviders?.length || 0} providers
                    {need.matchedResources?.length > 0 && ` · ${need.matchedResources.length} resources`}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <Link
                to={`/needs/${need._id}`}
                className="w-full glass-btn-secondary text-xs flex items-center justify-between group-hover:border-emerald-500/25"
              >
                <span>Track &amp; Manage Need</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
