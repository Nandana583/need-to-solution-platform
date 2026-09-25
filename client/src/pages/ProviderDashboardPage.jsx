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
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-emerald-950/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="glass-badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Provider Hub
              </span>
              <span className="text-xs text-slate-400">Additive Account Capability</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {user?.name}&apos;s Provider Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Manage your offered services, availability status, and match requests.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Role Verified: [provider]</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Offered Services</span>
            <Wrench className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{services.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Active repair/service listings</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Client Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{profile?.rating || 5.0}★</div>
          <p className="text-[11px] text-slate-400 mt-1">Based on {profile?.reviewCount || 0} reviews</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Completed Jobs</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {profile?.completedBookingsCount || 0}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total completed jobs</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase">Availability</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-300 mt-1">
            {profile?.availabilityStatus?.replace('_', ' ')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Current status</p>
        </div>
      </div>

      {/* Provider Profile Info & Edit */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Provider Profile & Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              These details help requesters discover you during two-phase matching.
            </p>
          </div>
          {!editingProfile && (
            <button
              onClick={() => setEditingProfile(true)}
              className="glass-btn-secondary text-xs flex items-center gap-1.5 text-emerald-300 border-emerald-500/30"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {editingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bio & Background
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your qualifications, skills, and specialties..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Fan Repair, Wiring, Math Tuition"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Area
                </label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Downtown, Campus Area"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Availability Status
              </label>
              <select
                value={availabilityStatus}
                onChange={(e) => setAvailabilityStatus(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
              >
                <option value="AVAILABLE_NOW" className="bg-slate-900">Available Now</option>
                <option value="BUSY" className="bg-slate-900">Busy with Existing Jobs</option>
                <option value="WEEKENDS_ONLY" className="bg-slate-900">Weekends Only</option>
                <option value="UNAVAILABLE" className="bg-slate-900">Unavailable</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProfile}
                className="glass-btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              {profile?.bio || 'No bio provided yet. Add one so clients know your expertise!'}
            </p>
            {profile?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Services Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-emerald-400" />
              My Listed Services ({services.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              These service packages appear directly in search and two-phase matching results.
            </p>
          </div>
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="glass-btn-primary py-2 px-4 text-xs flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-500"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Service Package</span>
          </button>
        </div>

        {services.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-white/10">
            <p className="text-sm text-slate-300 mb-2">No services listed yet.</p>
            <p className="text-xs text-slate-400 mb-4">
              Add your first repair service or tutoring package to begin receiving matches.
            </p>
            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="glass-btn-primary py-2 px-4 text-xs inline-flex"
            >
              Add First Service
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc) => (
              <div
                key={svc._id}
                className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        {svc.category?.name}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">{svc.title}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-white">${svc.rateAmount}</span>
                      <span className="text-[10px] text-slate-400 block uppercase">{svc.rateType}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-4 line-clamp-3">{svc.description}</p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {svc.availability}
                  </span>
                  <button
                    onClick={() => handleDeleteService(svc._id)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Service"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Create New Service Offering</h3>

            <form onSubmit={handleAddService} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category *
                </label>
                <select
                  value={svcCategoryId}
                  onChange={(e) => setSvcCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  required
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-slate-900">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ceiling Fan Repair & Speed Regulator Replacement"
                  value={svcTitle}
                  onChange={(e) => setSvcTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="What is included? (diagnostics, part replacement, testing...)"
                  value={svcDescription}
                  onChange={(e) => setSvcDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rate Type
                  </label>
                  <select
                    value={svcRateType}
                    onChange={(e) => setSvcRateType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  >
                    <option value="FIXED" className="bg-slate-900">Fixed Rate</option>
                    <option value="HOURLY" className="bg-slate-900">Hourly Rate</option>
                    <option value="CUSTOM" className="bg-slate-900">Custom / Quote</option>
                    <option value="FREE_COMMUNITY" className="bg-slate-900">Free Community</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rate Amount ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={svcRateAmount}
                    onChange={(e) => setSvcRateAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingService}
                  className="glass-btn-primary py-2 px-5 text-xs bg-gradient-to-r from-emerald-600 to-emerald-500"
                >
                  {addingService ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
