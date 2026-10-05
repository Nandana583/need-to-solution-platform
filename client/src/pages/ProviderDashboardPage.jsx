import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { providersApi } from '../api/providersApi';
import { categoriesApi } from '../api/categoriesApi';
import {
  Briefcase,
  Wrench,
  BookOpen,
  Clock,
  PlusCircle,
  ShieldCheck,
  Star,
  Trash2,
  Edit,
  MapPin,
  Save,
  Loader2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProviderDashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [editingProfile, setEditingProfile] = useState(false);
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState(1);
  const [serviceArea, setServiceArea] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('AVAILABLE_NOW');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [svcTitle, setSvcTitle] = useState('');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcCategoryId, setSvcCategoryId] = useState('');
  const [svcRateType, setSvcRateType] = useState('FIXED');
  const [svcRateAmount, setSvcRateAmount] = useState(30);
  const [svcAvailability, setSvcAvailability] = useState('Standard Working Hours');
  const [svcLocationLabel, setSvcLocationLabel] = useState('');
  const [addingService, setAddingService] = useState(false);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const [profRes, catsRes] = await Promise.all([
        providersApi.getMyProfile(),
        categoriesApi.getAll(),
      ]);

      if (profRes.success) {
        setProfile(profRes.profile);
        setServices(profRes.services || []);
        setBio(profRes.profile?.bio || '');
        setSkills(profRes.profile?.skills?.join(', ') || '');
        setExperienceYears(profRes.profile?.experienceYears || 1);
        setServiceArea(profRes.profile?.serviceArea || '');
        setAvailabilityStatus(profRes.profile?.availabilityStatus || 'AVAILABLE_NOW');
      }

      if (catsRes.success) {
        setCategories(catsRes.categories || []);
        if (catsRes.categories?.length > 0) {
          setSvcCategoryId(catsRes.categories[0]._id);
        }
      }
    } catch {
      toast.error('Failed to load provider profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await providersApi.updateMyProfile({
        bio,
        skills: skillsArray,
        experienceYears,
        serviceArea,
        availabilityStatus,
      });

      if (res.success) {
        toast.success('Provider profile updated!');
        setProfile(res.profile);
        setEditingProfile(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!svcTitle.trim() || !svcDescription.trim() || !svcCategoryId) {
      toast.error('Please fill all required service fields');
      return;
    }

    setAddingService(true);
    try {
      const res = await providersApi.createService({
        title: svcTitle,
        description: svcDescription,
        category: svcCategoryId,
        rateType: svcRateType,
        rateAmount: Number(svcRateAmount),
        availability: svcAvailability,
        locationLabel: svcLocationLabel || profile.serviceArea,
      });

      if (res.success) {
        toast.success('New service created!');
        setIsServiceModalOpen(false);
        setSvcTitle('');
        setSvcDescription('');
        fetchProviderData();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to create service');
    } finally {
      setAddingService(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service package?')) return;
    try {
      const res = await providersApi.deleteService(id);
      if (res.success) {
        toast.success('Service deleted');
        setServices((prev) => prev.filter((s) => s._id !== id));
      }
    } catch {
      toast.error('Failed to delete service');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-950/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="glass-badge bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Provider Hub
              </span>
              <span className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">Additive Account Capability</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              {user?.name}&apos;s Provider Dashboard
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">
              Manage your offered services, availability status, and match requests.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Role Verified: [provider]</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase">Offered Services</span>
            <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{services.length}</div>
          <p className="text-[11px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">Active repair/service listings</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase">Client Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">{profile?.rating || 5.0}★</div>
          <p className="text-[11px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">Based on {profile?.reviewCount || 0} reviews</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase">Completed Jobs</span>
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {profile?.completedBookingsCount || 0}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">Total completed jobs</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <div className="flex items-center justify-between text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-2">
            <span className="text-xs font-semibold uppercase">Availability</span>
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mt-1">
            {profile?.availabilityStatus?.replace('_', ' ')}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-1">Current status</p>
        </div>
      </div>

      {/* Provider Profile Info & Edit */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-black/10 dark:border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Provider Profile & Details</h2>
            <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-0.5">
              These details help requesters discover you during two-phase matching.
            </p>
          </div>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="glass-btn-secondary text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Bio & Background
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your qualifications, skills, and specialties..."
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Fan Repair, Wiring, Math Tuition"
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Service Area
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. North Zone, Campus, Downtown"
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
              >
                <option value="AVAILABLE_NOW" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Available Now</option>
                <option value="BUSY" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Busy (Taking bookings only)</option>
                <option value="WEEKENDS_ONLY" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Weekends Only</option>
                <option value="UNAVAILABLE" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Temporarily Unavailable</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="px-4 py-2 text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="glass-btn-primary py-2 px-5 text-xs"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)] italic">
              {profile?.bio || 'No bio entered yet. Click "Edit Details" to tell requesters about your services.'}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {profile?.skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] pt-2 border-t border-black/5 dark:border-white/5">
              <span>Experience: <strong className="text-[var(--text-primary)]">{profile?.experienceYears || 0} Years</strong></span>
              <span>Area: <strong className="text-[var(--text-primary)]">{profile?.serviceArea || 'Not specified'}</strong></span>
              <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">{profile?.availabilityStatus?.replace('_', ' ')}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Services Offered Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Your Listed Service Packages</h2>
            <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] mt-0.5">
              Requesters can book these services directly from search or two-phase matching.
            </p>
          </div>

          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="glass-btn-primary text-xs py-2 px-4 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Service Package</span>
          </button>
        </div>

        {services.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">
            You haven&apos;t added any service packages yet. Click &ldquo;Add Service Package&rdquo; to list your offerings.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc) => (
              <div
                key={svc._id}
                className="glass-card rounded-2xl p-6 border border-black/10 dark:border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        {svc.category?.name}
                      </span>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mt-1">
                        {svc.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-[var(--text-primary)]">
                        ${svc.rateAmount}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-muted)] block uppercase">
                        {svc.rateType}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] mb-4 whitespace-pre-wrap leading-relaxed">
                    {svc.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {svc.availability}
                    </span>
                    {svc.locationLabel && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5" />
                        {svc.locationLabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-black/5 dark:border-white/5 flex justify-end">
                  <button
                    onClick={() => handleDeleteService(svc._id)}
                    className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                    title="Delete service package"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-black/10 dark:border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-[var(--text-primary)]">Add New Service Package</h3>

            <form onSubmit={handleAddService} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ceiling Fan Bearing & Capacitor Repair"
                  value={svcTitle}
                  onChange={(e) => setSvcTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Category *
                </label>
                <select
                  value={svcCategoryId}
                  onChange={(e) => setSvcCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="What is included in this repair or service package?"
                  value={svcDescription}
                  onChange={(e) => setSvcDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Rate Type
                  </label>
                  <select
                    value={svcRateType}
                    onChange={(e) => setSvcRateType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                  >
                    <option value="FIXED" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Fixed Price</option>
                    <option value="HOURLY" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Hourly Rate</option>
                    <option value="CUSTOM" className="bg-charcoal-50 dark:bg-charcoal-900 text-[var(--text-primary)]">Custom / Contact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Rate Amount ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={svcRateAmount}
                    onChange={(e) => setSvcRateAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Availability Schedule
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mon-Sat 9:00 AM - 7:00 PM"
                  value={svcAvailability}
                  onChange={(e) => setSvcAvailability(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingService}
                  className="glass-btn-primary py-2 px-5 text-xs"
                >
                  {addingService ? 'Adding...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
