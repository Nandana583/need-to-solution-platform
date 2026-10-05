import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesApi } from '../api/categoriesApi';
import { needsApi } from '../api/needsApi';
import { bookingsApi } from '../api/bookingsApi';
import { sharesApi } from '../api/sharesApi';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Briefcase,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const PostNeedPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [needType, setNeedType] = useState('service');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [preferredSolutionType, setPreferredSolutionType] = useState('COMMERCIAL_FIRST');
  const [locationLabel, setLocationLabel] = useState('');
  const [requiredSkill, setRequiredSkill] = useState('');
  const [requiredService, setRequiredService] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');

  // Matching Result State
  const [matchResult, setMatchResult] = useState(null);
  const [postedNeed, setPostedNeed] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [shareModal, setShareModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [durationDays, setDurationDays] = useState(7);

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
      } catch (err) {
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
      const res = await needsApi.create({
        title,
        description,
        category: categoryId,
        needType,
        urgency,
        preferredSolutionType,
        locationLabel,
        requiredSkill,
        requiredService,
        preferredTime,
        duration,
        deadline: deadline || undefined,
      });

      if (res.success) {
        toast.success('Need posted and matches found!');
        setPostedNeed(res.need);
        setMatchResult(res.matches);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to post need');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookService = async () => {
    if (!bookingModal) return;
    setActionLoading(true);
    try {
      const res = await bookingsApi.create({
        serviceId: bookingModal.service._id,
        needId: postedNeed.id || postedNeed._id,
        scheduledDate: scheduledDate || new Date(Date.now() + 86400000).toISOString(),
        notes,
        locationLabel: locationLabel || bookingModal.service.locationLabel,
      });
      if (res.success) {
        toast.success('Service booking request sent to provider!');
        setBookingModal(null);
        navigate(`/needs/${postedNeed.id || postedNeed._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send booking request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendShareRequest = async () => {
    if (!shareModal) return;
    setActionLoading(true);
    try {
      const res = await sharesApi.create({
        resourceId: shareModal.resource._id,
        needId: postedNeed.id || postedNeed._id,
        requestType: shareModal.resource.shareType || 'BORROW',
        durationDays,
        message: shareMessage || `Hi! I would like to borrow "${shareModal.resource.title}".`,
      });
      if (res.success) {
        toast.success('Resource request sent to community member!');
        setShareModal(null);
        navigate(`/needs/${postedNeed.id || postedNeed._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send share request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      {!matchResult ? (
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="glass-badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 mb-3 inline-block">
              Two-Phase Solution Finder
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              What do you need solved?
            </h1>
            <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm mt-2 max-w-lg mx-auto">
              Post your service or resource need. We search verified local providers first, and automatically activate community solutions if none exist.
            </p>
          </div>

          {/* Post Need Form */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/15 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category & Need Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Category *
                  </label>
                  {loadingCats ? (
                    <div className="text-xs text-charcoal-400">Loading categories...</div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c._id} value={c._id} className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Need Classification
                  </label>
                  <select
                    value={needType}
                    onChange={(e) => setNeedType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                  >
                    <option value="service" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Professional Service / Repair</option>
                    <option value="resource" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Book, Notes or Equipment Share</option>
                    <option value="general" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">General Assistance</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Need Summary / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Urgent ceiling fan repair or Calculus textbook for semester exam"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your issue or what you're looking for in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input"
                  required
                ></textarea>
              </div>

              {/* Structured Capability Requirements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-black/[0.02] dark:bg-white/5 border border-black/5 dark:border-white/10">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Specific Service Required
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fan Repair, Switch Wiring, AC Filter"
                    value={requiredService}
                    onChange={(e) => setRequiredService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1 block">Exact capability to match against provider listings</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Profession / Skill Needed
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electrician, Plumber, Tutor"
                    value={requiredSkill}
                    onChange={(e) => setRequiredSkill(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1 block">Professional category or skill role</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Preferred Time of Day
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Morning, 4:00 PM - 6:00 PM, Today evening"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 hour, 30 minutes, Half day"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
                  />
                </div>
              </div>

              {/* Location & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Location / Area Label
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Campus North, Downtown, West Block"
                      value={locationLabel}
                      onChange={(e) => setLocationLabel(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl glass-input"
                    />
                    <MapPin className="w-4 h-4 text-charcoal-400 dark:text-[var(--text-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                  >
                    <option value="LOW" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Low - Flexible</option>
                    <option value="MEDIUM" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Medium - Within a few days</option>
                    <option value="HIGH" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">High - Within 24-48 hours</option>
                    <option value="CRITICAL" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Critical - Urgent today</option>
                  </select>
                </div>
              </div>

              {/* Deadline & Strategy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Required By (Deadline)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">
                    Matching Strategy
                  </label>
                  <select
                    value={preferredSolutionType}
                    onChange={(e) => setPreferredSolutionType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input"
                  >
                    <option value="COMMERCIAL_FIRST" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Commercial Provider First (Auto fallback)</option>
                    <option value="ANY" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Any Available (Provider or Community)</option>
                    <option value="COMMUNITY_FALLBACK_ONLY" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Community Sharers Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full glass-btn-primary py-3.5 text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 mt-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing Need & Matching Engine...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Post Need & Find Instant Matches</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Matching Results View */
        <div className="space-y-8 animate-fade-in">
          {/* Status Header */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/15 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="glass-badge bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 mb-2">
                  Need Posted Successfully
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
                  Matching Solutions for: &ldquo;{postedNeed?.title}&rdquo;
                </h1>
                <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm mt-1">
                  Our two-phase matching algorithm examined active professional services and community alternatives.
                </p>
              </div>

              <button
                onClick={() => navigate(`/needs/${postedNeed?.id || postedNeed?._id}`)}
                className="glass-btn-secondary text-sm"
              >
                <span>View Full Need Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Phase 1: Commercial / Professional Providers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Phase 1 — Professional Providers ({matchResult?.phase1Providers?.length || 0})
                </h2>
              </div>
              <span className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">Direct commercial booking</span>
            </div>

            {matchResult?.phase1Providers?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchResult.phase1Providers.map((m, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl p-6 border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-950/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                            {m.matchScore}% Match
                          </span>
                          <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                            {m.service.title}
                          </h3>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            Provider: {m.provider.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-[var(--text-primary)]">
                            ${m.service.rateAmount}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] block uppercase">
                            {m.service.rateType}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-3 leading-relaxed">
                        {m.service.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-black/20 border border-black/5 dark:border-white/5 mb-4 text-[11px] text-[var(--text-secondary)]">
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">Match Reason: </span>
                        {m.matchReason}
                      </div>
                    </div>

                    <button
                      onClick={() => setBookingModal(m)}
                      className="w-full glass-btn-primary py-2.5 text-sm"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Request / Book Service</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 border border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-950/10 text-center">
                <AlertCircle className="w-8 h-8 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                <h3 className="text-base font-semibold text-[var(--text-primary)]">No Commercial Providers Found in this Exact Category</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                  Automatic Fallback activated below to find peer students, resource owners, and community lenders.
                </p>
              </div>
            )}
          </div>

          {/* Phase 2: Community Fallback Solutions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-coral-600 dark:text-coral-400" />
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Phase 2 — Community Fallback Solutions ({matchResult?.phase2Fallbacks?.length || 0})
                </h2>
              </div>
              <span className="text-xs text-coral-700 dark:text-coral-300 bg-coral-500/10 px-2 py-0.5 rounded-full border border-coral-500/20 font-medium">
                Alternative Resource Sharers & Peer Lenders
              </span>
            </div>

            {matchResult?.phase2Fallbacks?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {matchResult.phase2Fallbacks.map((m, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl p-6 border border-teal-500/20 bg-teal-500/[0.03] dark:bg-teal-950/10 hover:border-teal-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                            Community Alternative • {m.matchScore}%
                          </span>
                          <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                            {m.resource.title}
                          </h3>
                          <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            Shared by: {m.owner.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-coral-500/20 text-coral-700 dark:text-coral-300 border border-coral-500/30">
                            {m.resource.shareType}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[var(--text-secondary)] mb-4 line-clamp-3 leading-relaxed">
                        {m.resource.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-black/[0.02] dark:bg-black/20 border border-black/5 dark:border-white/5 mb-4 text-[11px] text-[var(--text-secondary)]">
                        <span className="font-semibold text-teal-700 dark:text-teal-300">Fallback Reason: </span>
                        {m.matchReason}
                      </div>
                    </div>

                    <button
                      onClick={() => setShareModal(m)}
                      className="w-full glass-btn-secondary text-sm border-teal-500/30 hover:bg-teal-500/10 text-teal-700 dark:text-teal-300"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Request Resource Share / Borrow</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6 border border-black/5 dark:border-white/10 text-center">
                <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                  No community resources currently listed in this specific area. Your need remains active in the community feed.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/10 dark:border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Book Service with {bookingModal.provider.name}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{bookingModal.service.title}</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Notes for Provider</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Provide any additional details or requirements..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                onClick={() => setBookingModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBookService}
                disabled={actionLoading}
                className="glass-btn-primary py-2 px-5 text-xs"
              >
                {actionLoading ? 'Sending Request...' : 'Confirm Booking Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/10 dark:border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Request Resource from {shareModal.owner.name}</h3>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-medium">{shareModal.resource.title}</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Message to Resource Owner</label>
                <textarea
                  rows={3}
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why you need this resource..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
              <button
                onClick={() => setShareModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendShareRequest}
                disabled={actionLoading}
                className="glass-btn-primary py-2 px-5 text-xs"
              >
                {actionLoading ? 'Sending Request...' : 'Send Community Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
