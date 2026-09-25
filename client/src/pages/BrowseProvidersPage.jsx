import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { providersApi } from '../api/providersApi';
import { categoriesApi } from '../api/categoriesApi';
import {
  Briefcase,
  Star,
  Search,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const BrowseProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await providersApi.getPublicProviders({
        category: selectedCat || undefined,
        search: search || undefined,
      });
      if (res.success) {
        setProviders(res.providers || []);
      }
    } catch (err) {
      toast.error('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.success) {
          setCategories(res.categories || []);
        }
      } catch {
        // ignore
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [selectedCat]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProviders();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="glass-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-2 inline-block">
          Verified Service Professionals
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Find Local & Remote Experts
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Discover verified technicians, electricians, appliance repair specialists, and tutors ready to assist.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by provider name, skills, repair type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === ''
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCat(cat._id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat._id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : providers.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto">
          <Briefcase className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">No Providers Found</h2>
          <p className="text-slate-400 text-xs mb-4">
            No suitable provider is currently available for this requirement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p._id}
              className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-bold text-base text-white shadow-md">
                      {p.user?.name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                        {p.user?.name}
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </h3>
                      <p className="text-xs text-slate-400">
                        {p.experienceYears} yrs experience
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.rating || 5.0}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-4 line-clamp-3">
                  {p.bio || 'Experienced verified service provider ready to tackle local needs.'}
                </p>

                {/* Skills tags */}
                {p.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.skills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                    {p.skills.length > 4 && (
                      <span className="text-[10px] text-slate-400">
                        +{p.skills.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-white/5 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {p.availabilityStatus.replace('_', ' ')}
                  </span>
                  {p.serviceArea && (
                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                      <MapPin className="w-3.5 h-3.5" />
                      {p.serviceArea}
                    </span>
                  )}
                </div>
              </div>

              <Link
                to={`/providers/${p.user?._id || p._id}`}
                className="w-full glass-btn-primary py-2 text-xs flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/20"
              >
                <span>View Profile & Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
