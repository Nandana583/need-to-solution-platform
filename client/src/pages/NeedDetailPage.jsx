import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { needsApi } from '../api/needsApi';
import { bookingsApi } from '../api/bookingsApi';
import { sharesApi } from '../api/sharesApi';
import {
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  Users,
  CheckCircle,
  Calendar,
  Share2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  'CREATED',
  'MATCHING',
  'REQUESTED',
  'ACCEPTED',
  'IN_PROGRESS',
  'COMPLETED',
];

export const NeedDetailPage = () => {
  const { id } = useParams();
  const [need, setNeed] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const fetchNeed = async () => {
    try {
      const res = await needsApi.getById(id);
      if (res.success) {
        setNeed(res.need);
      }
    } catch (err) {
      toast.error('Failed to load need details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeed();
  }, [id]);

  const handleRecalculate = async () => {
    setRecalculating(true);
    try {
      const res = await needsApi.recalculateMatches(id);
      if (res.success) {
        toast.success('Matches updated!');
        await fetchNeed();
      }
    } catch (err) {
      toast.error('Failed to recalculate matches');
    } finally {
      setRecalculating(false);
    }
  };

  const handleCancelNeed = async () => {
    if (!window.confirm('Are you sure you want to cancel this need request?')) return;
    try {
      const res = await needsApi.cancel(id);
      if (res.success) {
        toast.success('Need cancelled');
        await fetchNeed();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to cancel need');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (!need) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center glass-card p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">Need Not Found</h2>
        <Link to="/dashboard" className="glass-btn-primary text-xs inline-flex mt-4">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(need.status);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to="/needs"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Needs</span>
      </Link>

      {/* Header & Status */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                {need.category?.name}
              </span>
              <span className="text-xs font-mono text-slate-400">
                ID: #{need._id.slice(-6)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {need.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {need.status !== 'CANCELLED' && need.status !== 'COMPLETED' && (
              <button
                onClick={handleCancelNeed}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
              >
                Cancel Need
              </button>
            )}
            <button
              onClick={handleRecalculate}
              disabled={recalculating}
              className="glass-btn-secondary text-xs flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin' : ''}`} />
              <span>Refresh Matches</span>
            </button>
          </div>
        </div>

        {/* Visual Lifecycle Stepper */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Request Lifecycle: <span className="text-primary-400">{need.status}</span>
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = currentStepIndex >= idx;
              const isCurrent = need.status === step;
              return (
                <div
                  key={step}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-primary-500/20 border-primary-500/50 text-white font-bold shadow-lg shadow-primary-500/20'
                      : isPast
                      ? 'bg-white/10 border-white/15 text-slate-200'
                      : 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="text-[10px] font-mono">{idx + 1}</div>
                  <div className="text-[11px] truncate mt-0.5">{step}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Need Details Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white">Need Description</h2>
          <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
            {need.description}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Urgency</span>
              <span className="font-semibold text-white">{need.urgency}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Location</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary-400" />
                {need.locationLabel || 'Flexible / Local'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">Created Date</span>
              <span className="font-semibold text-white">
                {new Date(need.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Solution Status */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3">
          <h2 className="text-base font-bold text-white">Selected Solution</h2>
          {need.selectedSolution?.solutionType === 'PROVIDER_SERVICE' ? (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300">
                COMMERCIAL BOOKING
              </span>
              <p className="text-xs text-slate-200 mt-2">
                Connected with a professional service provider. Check your Bookings tab for status updates.
              </p>
              <Link to="/bookings" className="glass-btn-primary py-2 px-3 text-xs mt-3 block text-center">
                Open My Bookings
              </Link>
            </div>
          ) : need.selectedSolution?.solutionType === 'COMMUNITY_RESOURCE' ? (
            <div className="p-4 rounded-xl bg-primary-950/20 border border-primary-500/30">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-500/30 text-primary-300">
                COMMUNITY SHARE
              </span>
              <p className="text-xs text-slate-200 mt-2">
                Connected with a community resource owner. Check your Shares tab for status updates.
              </p>
              <Link to="/shares" className="glass-btn-secondary py-2 px-3 text-xs mt-3 block text-center">
                Open My Shares
              </Link>
            </div>
          ) : (
            <div className="text-xs text-slate-400 py-4 text-center">
              No solution selected yet. Choose from matched options below.
            </div>
          )}
        </div>
      </div>

      {/* Matched Solutions Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          Two-Phase Match Results
        </h2>

        {/* Phase 1 Matches */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Phase 1: Professional Providers ({need.matchedProviders?.length || 0})
          </h3>

          {need.matchedProviders?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {need.matchedProviders.map((m, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {m.matchScore}% Match
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">
                          {m.service?.title}
                        </h4>
                        <p className="text-xs text-emerald-300">
                          Provider: {m.provider?.name}
                        </p>
                      </div>
                      <span className="text-base font-bold text-white">
                        ${m.service?.rateAmount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                      {m.service?.description}
                    </p>
                    <p className="text-[11px] text-emerald-300/80 mt-2 bg-black/20 p-2 rounded-lg">
                      {m.matchReason}
                    </p>
                  </div>
                  <Link
                    to={`/providers/${m.provider?._id || m.provider?.id}`}
                    className="glass-btn-primary py-2 text-xs mt-4 text-center"
                  >
                    View Provider & Book
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl glass-card text-xs text-slate-400 border border-white/5">
              No direct commercial service matched. Check community fallbacks below.
            </div>
          )}
        </div>

        {/* Phase 2 Matches */}
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Phase 2: Community Fallback Resources ({need.matchedResources?.length || 0})
          </h3>

          {need.matchedResources?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {need.matchedResources.map((m, idx) => (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-5 border border-primary-500/20 bg-primary-950/10 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300">
                          Community Fallback • {m.matchScore}%
                        </span>
                        <h4 className="text-base font-bold text-white mt-1">
                          {m.resource?.title}
                        </h4>
                        <p className="text-xs text-primary-300">
                          Owner: {m.owner?.name}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {m.resource?.shareType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                      {m.resource?.description}
                    </p>
                    <p className="text-[11px] text-primary-300/80 mt-2 bg-black/20 p-2 rounded-lg">
                      {m.matchReason}
                    </p>
                  </div>
                  <Link
                    to={`/resources/${m.resource?._id || m.resource?.id}`}
                    className="glass-btn-secondary py-2 text-xs mt-4 text-center"
                  >
                    View Resource & Request Share
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl glass-card text-xs text-slate-400 border border-white/5">
              We couldn't find a suitable community match right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
