import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resourcesApi } from '../api/resourcesApi';
import { categoriesApi } from '../api/categoriesApi';
import {
  BookOpen,
  Search,
  PlusCircle,
  Share2,
  MapPin,
  Clock,
  Loader2,
  ArrowRight,
  Layers,
  FileText,
  Wrench,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const BrowseResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [search, setSearch] = useState('');

  const fetchResources = async () => {
    setLoading(true);
    try {
      const res = await resourcesApi.getPublic({
        category: selectedCat || undefined,
        resourceType: resourceType || undefined,
        search: search || undefined,
      });
      if (res.success) {
        setResources(res.resources || []);
      }
    } catch (err) {
      toast.error('Failed to load community resources');
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
    fetchResources();
  }, [selectedCat, resourceType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="glass-badge bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 mb-2 inline-block">
            Peer Sharing & Community Fallbacks
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Community Resource Hub
          </h1>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm mt-1">
            Borrow textbooks, browse lecture notes, share lab equipment, and access peer study materials.
          </p>
        </div>

        <Link to="/resources/new" className="glass-btn-primary text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>Share a Resource</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-black/10 dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-charcoal-400 dark:text-[var(--text-muted)] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by book title, author, course subject, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input"
          />
        </form>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-input"
          >
            <option value="" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">All Types</option>
            <option value="book" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Textbooks</option>
            <option value="notes" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Handwritten Notes</option>
            <option value="study_material" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Study Materials</option>
            <option value="equipment" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Lab Equipment & Tools</option>
          </select>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass-input"
          >
            <option value="" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id} className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-black/10 dark:border-white/10 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-teal-600 dark:text-teal-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Matching Resources Found</h2>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-xs mb-4">
            No community resource matches this filter right now. Be the first to share!
          </p>
          <Link to="/resources/new" className="glass-btn-primary text-sm inline-flex">
            Share First Resource
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <div
              key={r._id}
              className="glass-card rounded-2xl p-6 border border-teal-500/20 bg-teal-500/[0.03] dark:bg-teal-950/10 hover:border-teal-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                    {r.resourceType.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-coral-500/20 text-coral-700 dark:text-coral-300 border border-coral-500/30">
                    {r.shareType}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 line-clamp-1">
                  {r.title}
                </h3>

                {r.metadata?.author && (
                  <p className="text-xs text-teal-700 dark:text-teal-300 mb-2 font-medium">
                    Author: {r.metadata.author} {r.metadata.edition && `(${r.metadata.edition} Ed)`}
                  </p>
                )}

                <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>

                <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-black/20 border border-black/5 dark:border-white/5 text-[11px] text-[var(--text-secondary)] mb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Owner:</span>
                    <span className="font-semibold text-[var(--text-primary)]">{r.owner?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Condition:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">{r.condition}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/resources/${r._id}`}
                className="w-full glass-btn-secondary text-xs flex items-center justify-center gap-1.5 border-teal-500/30 hover:bg-teal-500/10 text-teal-700 dark:text-teal-300"
              >
                <span>View Details & Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
