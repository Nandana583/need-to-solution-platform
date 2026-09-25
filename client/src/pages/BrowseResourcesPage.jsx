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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="glass-badge bg-primary-500/20 text-primary-300 border border-primary-500/30 mb-2 inline-block">
            Peer Sharing & Community Fallbacks
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Community Resource Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Borrow textbooks, browse lecture notes, share lab equipment, and access peer study materials.
          </p>
        </div>

        <Link to="/resources/new" className="glass-btn-primary text-sm flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          <span>Share a Resource</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by book title, author, course subject, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </form>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white"
          >
            <option value="" className="bg-slate-900">All Types</option>
            <option value="book" className="bg-slate-900">Textbooks</option>
            <option value="notes" className="bg-slate-900">Handwritten Notes</option>
            <option value="study_material" className="bg-slate-900">Study Materials</option>
            <option value="equipment" className="bg-slate-900">Lab Equipment & Tools</option>
          </select>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white"
          >
            <option value="" className="bg-slate-900">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id} className="bg-slate-900">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : resources.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-primary-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">No Matching Resource</h2>
          <p className="text-slate-400 text-xs mb-4">
            No matching resource is currently available.
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
              className="glass-card rounded-2xl p-6 border border-primary-500/20 bg-primary-950/10 hover:border-primary-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                    {r.resourceType.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {r.shareType}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                  {r.title}
                </h3>

                {r.metadata?.author && (
                  <p className="text-xs text-primary-400 mb-2">
                    Author: {r.metadata.author} {r.metadata.edition && `(${r.metadata.edition} Ed)`}
                  </p>
                )}

                <p className="text-xs text-slate-300 mb-4 line-clamp-2">
                  {r.description}
                </p>

                <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 text-[11px] text-slate-300 mb-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Owner:</span>
                    <span className="font-semibold text-white">{r.owner?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Condition:</span>
                    <span className="text-emerald-400 font-medium">{r.condition}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/resources/${r._id}`}
                className="w-full glass-btn-secondary text-xs flex items-center justify-center gap-1.5 border-primary-500/30 hover:bg-primary-500/10 text-primary-300"
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
