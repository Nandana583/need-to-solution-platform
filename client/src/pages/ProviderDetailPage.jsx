import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { providersApi } from '../api/providersApi';
import { bookingsApi } from '../api/bookingsApi';
import {
  Briefcase,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Wrench,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ProviderDetailPage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedService, setSelectedService] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadProvider = async () => {
      try {
        const res = await providersApi.getProviderById(id);
        if (res.success) {
          setProfile(res.profile);
          setServices(res.services || []);
          setReviews(res.reviews || []);
        }
      } catch (err) {
        toast.error('Failed to load provider profile');
      } finally {
        setLoading(false);
      }
    };
    loadProvider();
  }, [id]);

  const handleBookService = async () => {
    if (!selectedService) return;
    setBookingLoading(true);
    try {
      const res = await bookingsApi.create({
        serviceId: selectedService._id,
        scheduledDate: scheduledDate || new Date(Date.now() + 86400000).toISOString(),
        notes,
        locationLabel: selectedService.locationLabel || profile.user?.locationLabel,
      });
      if (res.success) {
        toast.success('Service booking request sent!');
        setSelectedService(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center glass-card p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">Provider Not Found</h2>
        <Link to="/providers" className="glass-btn-primary text-xs inline-flex mt-4">
          Browse All Providers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/providers"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Providers</span>
      </Link>

      {/* Provider Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/20 bg-emerald-950/10 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-extrabold text-3xl text-white shadow-xl shadow-emerald-500/30">
              {profile.user?.name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {profile.user?.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300">
                {profile.experienceYears} Years Experience • Active Service Provider
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                {profile.serviceArea && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {profile.serviceArea}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {profile.availabilityStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
            <div className="text-center px-3">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-xl">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{profile.rating || 5.0}</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {profile.reviewCount || 0} Reviews
              </span>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-center px-3">
              <span className="text-xl font-bold text-white block">
                {profile.completedBookingsCount || 0}
              </span>
              <span className="text-[10px] text-slate-400">Completed Jobs</span>
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              About Provider
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Skills list */}
        {profile.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Services Offered Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            Offered Services ({services.length})
          </h2>
        </div>

        {services.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center text-xs text-slate-400">
            No specific service packages listed right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((svc) => (
              <div
                key={svc._id}
                className="glass-card rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                        {svc.category?.name}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {svc.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-white">
                        ${svc.rateAmount}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        {svc.rateType}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mb-4 whitespace-pre-wrap">
                    {svc.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
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

                <button
                  onClick={() => setSelectedService(svc)}
                  className="w-full glass-btn-primary py-2.5 text-xs bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/20"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book This Service</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white">
            Client Reviews ({reviews.length})
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-xs text-slate-400">
            No client reviews posted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div
                key={r._id}
                className="glass-card rounded-2xl p-5 border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center font-bold text-xs text-white">
                      {r.reviewer?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-white">
                      {r.reviewer?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{r.rating}★</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic">&ldquo;{r.comment}&rdquo;</p>
                <span className="text-[10px] text-slate-500 block pt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">
              Book Service: {selectedService.title}
            </h3>
            <p className="text-xs text-emerald-400 font-semibold">
              Provider: {profile.user?.name} • ${selectedService.rateAmount} ({selectedService.rateType})
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Requested Date *
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm [color-scheme:dark]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Details / Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your timing preference, specific appliance brand, or any questions..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleBookService}
                disabled={bookingLoading}
                className="glass-btn-primary py-2 px-5 text-xs bg-gradient-to-r from-emerald-600 to-emerald-500"
              >
                {bookingLoading ? 'Sending Request...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
