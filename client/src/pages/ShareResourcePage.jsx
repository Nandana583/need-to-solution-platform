import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../api/categoriesApi';
import { resourcesApi } from '../api/resourcesApi';
import {
  BookOpen,
  Sparkles,
  MapPin,
  Layers,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ShareResourcePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [resourceType, setResourceType] = useState('book');
  const [condition, setCondition] = useState('GOOD');
  const [shareType, setShareType] = useState('LEND');
  const [author, setAuthor] = useState('');
  const [subject, setSubject] = useState('');
  const [edition, setEdition] = useState('');
  const [locationLabel, setLocationLabel] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await categoriesApi.getAll();
        if (res.success) {
          setCategories(res.categories || []);
          if (res.categories?.length > 0) {
            setCategoryId(res.categories[0]._id);
          }
        }
      } catch {
        toast.error('Failed to load categories');
      } finally {
        setLoadingCats(false);
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !categoryId) {
      toast.error('Please fill in title, description and category');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resourcesApi.create({
        title,
        description,
        category: categoryId,
        resourceType,
        condition,
        shareType,
        metadata: {
          author,
          subject,
          edition,
        },
        locationLabel,
      });

      if (res.success) {
        toast.success('Resource shared successfully!');
        navigate('/resources');
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to share resource');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <span className="glass-badge bg-primary-500/20 text-primary-300 border border-primary-500/30 mb-2 inline-block">
          Community Peer Sharing
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Share a Textbook, Notes or Tools
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Help peers and students nearby when normal commercial solutions are unavailable.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Category *
              </label>
              {loadingCats ? (
                <div className="text-xs text-slate-400">Loading...</div>
              ) : (
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-primary-500"
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-slate-900 text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Resource Type
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="book" className="bg-slate-900 text-white">Textbook</option>
                <option value="notes" className="bg-slate-900 text-white">Handwritten Lecture Notes</option>
                <option value="study_material" className="bg-slate-900 text-white">Exam Question Papers / Study Material</option>
                <option value="equipment" className="bg-slate-900 text-white">Lab Equipment / Tools</option>
                <option value="device" className="bg-slate-900 text-white">Calculator / Electronic Device</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Resource Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Higher Engineering Mathematics by B.S. Grewal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Description *
            </label>
            <textarea
              rows={3}
              placeholder="Describe condition, missing pages, covered topics, or lending terms..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:ring-2 focus:ring-primary-500"
              required
            ></textarea>
          </div>

          {/* Book / Material Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Author / Creator
              </label>
              <input
                type="text"
                placeholder="e.g. B.S. Grewal, Tanenbaum"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Subject / Branch
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Networks, Physics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Edition / Year
              </label>
              <input
                type="text"
                placeholder="e.g. 44th Ed, 2024"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
          </div>

          {/* Sharing Terms & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Sharing Mode
              </label>
              <select
                value={shareType}
                onChange={(e) => setShareType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="LEND" className="bg-slate-900 text-white">Lend (Return expected)</option>
                <option value="GIVEAWAY" className="bg-slate-900 text-white">Free Giveaway / Donate</option>
                <option value="PHOTOCOPY_SHARE" className="bg-slate-900 text-white">Photocopy / Digital Share</option>
                <option value="HELP" className="bg-slate-900 text-white">Peer Help / Guidance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="NEW" className="bg-slate-900 text-white">Brand New</option>
                <option value="LIKE_NEW" className="bg-slate-900 text-white">Like New</option>
                <option value="GOOD" className="bg-slate-900 text-white">Good</option>
                <option value="FAIR" className="bg-slate-900 text-white">Fair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Pickup / Area Label
              </label>
              <input
                type="text"
                placeholder="e.g. Main Library, Hostel 4"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full glass-btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-xl shadow-primary-500/25"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Listing Resource...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Publish Resource to Community Hub</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
