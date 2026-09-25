import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { bookingsApi } from '../api/bookingsApi';
import { reviewsApi } from '../api/reviewsApi';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  MapPin,
  Loader2,
  Briefcase,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { RequestCommunication } from '../components/communication/RequestCommunication';

export const BookingsPage = () => {
  const { isProvider } = useAuth();
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'incoming'
  const [myRequests, setMyRequests] = useState([]);
  const [incomingBookings, setIncomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const [reqRes, incRes] = await Promise.all([
        bookingsApi.getMyRequests(),
        isProvider ? bookingsApi.getIncomingProvider() : Promise.resolve({ success: true, bookings: [] }),
      ]);

      if (reqRes.success) setMyRequests(reqRes.bookings || []);
      if (incRes.success) setIncomingBookings(incRes.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [isProvider]);

  const handleAccept = async (id) => {
    try {
      const res = await bookingsApi.accept(id);
      if (res.success) {
        toast.success('Booking accepted!');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to accept booking');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Please provide a brief reason for declining:');
    if (reason === null) return;
    try {
      const res = await bookingsApi.reject(id, reason);
      if (res.success) {
        toast.success('Booking rejected');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to reject booking');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await bookingsApi.complete(id);
      if (res.success) {
        toast.success('Booking marked as completed!');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to complete booking');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingsApi.cancel(id);
      if (res.success) {
        toast.success('Booking cancelled');
        fetchBookings();
      }
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await reviewsApi.create({
        bookingId: reviewModalBooking._id,
        rating,
        comment,
      });
      if (res.success) {
        toast.success('Review submitted successfully!');
        setReviewModalBooking(null);
        setComment('');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentList = activeTab === 'requests' ? myRequests : incomingBookings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Service Bookings</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your service requests and view provider responses.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 p-1.5 rounded-2xl glass-card border border-white/10">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'requests'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            My Service Requests ({myRequests.length})
          </button>
          {isProvider && (
            <button
              onClick={() => setActiveTab('incoming')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'incoming'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Incoming Client Jobs ({incomingBookings.length})
            </button>
          )}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">No Bookings Found</h2>
          <p className="text-slate-400 text-xs">
            {activeTab === 'requests'
              ? 'When you book a service from matches or provider profiles, they will appear here.'
              : 'Incoming client booking requests will appear here when requesters select your services.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((b) => (
            <div
              key={b._id}
              className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      b.status === 'ACCEPTED' || b.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : b.status === 'REJECTED' || b.status === 'CANCELLED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: #{b._id.slice(-6)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  {b.service?.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span>
                    {activeTab === 'requests' ? (
                      <>Provider: <strong className="text-emerald-400">{b.provider?.name}</strong></>
                    ) : (
                      <>Client: <strong className="text-primary-400">{b.requester?.name}</strong></>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    Date: {new Date(b.scheduledDate).toLocaleDateString()}
                  </span>
                  {b.agreedPrice !== undefined && (
                    <span className="font-bold text-white">
                      Price: ${b.agreedPrice}
                    </span>
                  )}
                </div>

                {b.notes && (
                  <p className="text-xs text-slate-400 italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                    &ldquo;{b.notes}&rdquo;
                  </p>
                )}
                {b.rejectionReason && (
                  <p className="text-xs text-rose-300 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20">
                    Decline reason: {b.rejectionReason}
                  </p>
                )}

                {/* Integrated Persistent Request Communication */}
                <div className="pt-2">
                  <RequestCommunication
                    bookingId={b._id}
                    otherPartyName={activeTab === 'requests' ? b.provider?.name : b.requester?.name}
                    itemTitle={b.service?.title}
                    currentStatus={b.status}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {activeTab === 'incoming' && b.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAccept(b._id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
                    >
                      Accept Job
                    </button>
                    <button
                      onClick={() => handleReject(b._id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}

                {b.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleComplete(b._id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}

                {activeTab === 'requests' && b.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-rose-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}

                {/* Leave Review Button */}
                {activeTab === 'requests' && b.status === 'COMPLETED' && !b.isReviewed && (
                  <button
                    onClick={() => setReviewModalBooking(b)}
                    className="glass-btn-primary py-2 px-4 text-xs flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Leave Review</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Rate & Review Service</h3>
            <p className="text-xs text-slate-300">
              Provider: {reviewModalBooking.provider?.name} ({reviewModalBooking.service?.title})
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-2 rounded-xl transition-all"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400 scale-110'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Feedback Comment
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How was the service quality, punctuality and communication?"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="glass-btn-primary py-2 px-5 text-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
