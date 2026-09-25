import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { needsApi } from '../api/needsApi';
import {
  FileText,
  PlusCircle,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyNeedsPage = () => {
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeeds = async () => {
      try {
        const res = await needsApi.getMyNeeds();
        if (res.success) {
          setNeeds(res.needs || []);
        }
      } catch (err) {
        toast.error('Failed to load your needs');
      } finally {
        setLoading(false);
      }
    };
    fetchNeeds();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">My Posted Needs</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track your service requests, study material needs, and matched solutions.
          </p>
        </div>
        <Link to="/needs/new" className="glass-btn-primary text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>Post a New Need</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : needs.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto">
          <FileText className="w-12 h-12 text-primary-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">No Needs Posted Yet</h2>
          <p className="text-slate-400 text-xs mb-6">
            Whenever you need a repair, tuition, study books, or peer assistance, post a need here to get instant two-phase matches.
          </p>
          <Link to="/needs/new" className="glass-btn-primary text-sm inline-flex">
            Post Your First Need
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {needs.map((need) => (
            <div
              key={need._id}
              className="glass-card rounded-2xl p-6 border border-white/10 hover:border-primary-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    {need.category?.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      need.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : need.status === 'CANCELLED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {need.status}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                  {need.title}
                </h3>
                <p className="text-xs text-slate-300 mb-4 line-clamp-2">
                  {need.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(need.createdAt).toLocaleDateString()}
                  </span>
                  {need.locationLabel && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-primary-400" />
                      {need.locationLabel}
                    </span>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-[11px] text-slate-300 mb-4 flex items-center justify-between">
                  <span>Matches Found:</span>
                  <span className="font-semibold text-primary-300">
                    {need.matchedProviders?.length || 0} Providers • {need.matchedResources?.length || 0} Fallbacks
                  </span>
                </div>
              </div>

              <Link
                to={`/needs/${need._id}`}
                className="w-full glass-btn-secondary text-xs flex items-center justify-center gap-1.5"
              >
                <span>Track & Manage Need</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
