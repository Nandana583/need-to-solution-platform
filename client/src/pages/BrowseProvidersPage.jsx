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
  Loader2,
  ArrowRight,
  X,
  Users,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Availability status config ── */
const availabilityConfig = {
  AVAILABLE_NOW:  { label: 'Available Now',  dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' },
  WEEKENDS_ONLY:  { label: 'Weekends Only',  dot: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25' },
  BUSY:           { label: 'Busy',           dot: 'bg-rose-500',    text: 'text-rose-700 dark:text-rose-400',     bg: 'bg-rose-500/10',    border: 'border-rose-500/25' },
  ON_LEAVE:       { label: 'On Leave',       dot: 'bg-charcoal-400', text: 'text-[var(--text-secondary)] dark:text-charcoal-400', bg: 'bg-charcoal-400/10', border: 'border-charcoal-400/20' },
};

/* ── Provider Card Skeleton ── */
const ProviderSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 border border-black/5 dark:border-white/8 animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl skeleton shrink-0" />
      <div className="flex-1">
        <div className="h-4 skeleton rounded-full w-32 mb-2" />
        <div className="h-3 skeleton rounded-full w-20" />
      </div>
      <div className="w-14 h-5 skeleton rounded-full" />
    </div>
    <div className="h-3 skeleton rounded-full w-full mb-2" />
    <div className="h-3 skeleton rounded-full w-3/4 mb-5" />
    <div className="flex gap-1.5 mb-5">
      {[1, 2, 3].map(i => <div key={i} className="h-5 w-16 skeleton rounded-full" />)}
    </div>
    <div className="h-px skeleton mb-4" />
    <div className="h-9 skeleton rounded-xl" />
  </div>
);

/* ── Main Page ── */
export const BrowseProvidersPage = () => {
  const [providers, setProviders]     = useState([]);
  const [categories, setCategories]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch]           = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await providersApi.getPublicProviders({
        category: selectedCat || undefined,
        search: search || undefined,
      });
      if (res.success) setProviders(res.providers || []);
    } catch {
      toast.error('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.success) setCategories(res.categories || []);
      } catch { /* ignore */ }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [selectedCat, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  const clearAll = () => {
    clearSearch();
    setSelectedCat('');
  };

  const hasFilters = search || selectedCat;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="glass-badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/22 mb-3 inline-flex">
          <ShieldCheck className="w-3.5 h-3.5" />
          Verified Service Professionals
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight mt-1">
          Find Local &amp; Remote Experts
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-2.5 leading-relaxed">
          Discover verified technicians, electricians, appliance repair specialists, and tutors ready to assist.
        </p>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 border border-black/8 dark:border-white/10 space-y-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            id="provider-search"
            placeholder="Search by provider name, skills, or service type…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-28 py-3 glass-input rounded-xl"
            aria-label="Search providers"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button type="submit" className="glass-btn-primary text-xs px-3.5 py-1.5">
              Search
            </button>
          </div>
        </form>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="Category filters">
          <button
            onClick={() => setSelectedCat('')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              !selectedCat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-black/[0.04] dark:bg-white/[0.05] text-[var(--text-secondary)] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] border border-black/8 dark:border-white/8'
            }`}
            aria-pressed={!selectedCat}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCat(cat._id)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedCat === cat._id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-black/[0.04] dark:bg-white/[0.05] text-[var(--text-secondary)] hover:bg-black/[0.08] dark:hover:bg-white/[0.09] border border-black/8 dark:border-white/8'
              }`}
              aria-pressed={selectedCat === cat._id}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Active filters:
            </span>
            {search && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-black/[0.05] dark:bg-white/[0.07] text-[var(--text-secondary)] border border-black/8 dark:border-white/10">
                &ldquo;{search}&rdquo;
                <button onClick={clearSearch} className="hover:text-rose-500 transition-colors ml-0.5" aria-label="Remove search filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedCat && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {categories.find(c => c._id === selectedCat)?.name}
                <button onClick={() => setSelectedCat('')} className="hover:text-rose-500 transition-colors ml-0.5" aria-label="Remove category filter">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAll}
              className="text-xs text-[var(--text-muted)] hover:text-rose-500 transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Results count ── */}
      {!loading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            {providers.length === 0
              ? 'No providers found'
              : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`
            }
            {hasFilters && <span className="text-emerald-600 dark:text-emerald-400 font-medium"> matching your criteria</span>}
          </p>
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <ProviderSkeleton key={i} />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="glass-card rounded-3xl p-14 text-center border border-black/8 dark:border-white/10 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <Users className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Matching Providers Found</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
            No suitable provider is currently available for this requirement. Try posting a need to discover community alternatives.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={clearAll} className="glass-btn-secondary text-xs px-5 py-2">
              Clear All Filters
            </button>
            <Link to="/needs/new" className="glass-btn-primary text-xs px-5 py-2">
              Post a Need Instead
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map((p) => {
            const avail = availabilityConfig[p.availabilityStatus] || availabilityConfig.AVAILABLE_NOW;
            return (
              <div
                key={p._id}
                className="glass-card rounded-2xl p-6 border border-black/8 dark:border-white/10 hover:border-emerald-500/28 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] flex flex-col group"
              >
                {/* Provider header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-md shrink-0"
                      style={{ background: 'linear-gradient(135deg, #047857 0%, #0d9488 100%)' }}
                      aria-hidden="true"
                    >
                      {p.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5 truncate">
                        <span className="truncate">{p.user?.name}</span>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="Verified provider" />
                      </h3>
                      <p className="text-xs text-[var(--text-muted)]">
                        {p.experienceYears || 1} yr{(p.experienceYears || 1) !== 1 ? 's' : ''} experience
                      </p>
                    </div>
                  </div>

                  {/* Rating badge */}
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                      {typeof p.rating === 'number' ? p.rating.toFixed(1) : '5.0'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed flex-1">
                  {p.bio || 'Experienced verified service provider ready to tackle local needs.'}
                </p>

                {/* Skills */}
                {p.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.skills.slice(0, 4).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] text-[var(--text-muted)] border border-black/[0.05] dark:border-white/[0.06] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {p.skills.length > 4 && (
                      <span className="text-[10px] text-[var(--text-muted)] self-center font-medium">
                        +{p.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta: availability + location */}
                <div className="flex items-center justify-between text-[11px] pt-3 border-t border-black/[0.04] dark:border-white/[0.05] mb-4">
                  <span className={`inline-flex items-center gap-1.5 font-semibold ${avail.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${avail.dot}`} aria-hidden="true" />
                    {avail.label}
                  </span>
                  {p.serviceArea && (
                    <span className="flex items-center gap-1 text-[var(--text-muted)] truncate max-w-[130px]">
                      <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{p.serviceArea}</span>
                    </span>
                  )}
                </div>

                {/* CTA */}
                <Link
                  to={`/providers/${p.user?._id || p._id}`}
                  className="w-full glass-btn-primary py-2.5 text-xs group-hover:shadow-[var(--shadow-glow-emerald)]"
                >
                  <span>View Profile &amp; Services</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
