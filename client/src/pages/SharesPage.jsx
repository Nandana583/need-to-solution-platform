import React, { useState, useEffect } from 'react';
import { sharesApi } from '../api/sharesApi';
import { reviewsApi } from '../api/reviewsApi';
import {
  Share2,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  BookOpen,
  Loader2,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { RequestCommunication } from '../components/communication/RequestCommunication';

export const SharesPage = () => {
  const [activeTab, setActiveTab] = useState('sent'); // 'sent' | 'incoming'
  const [sentRequests, setSentRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModalShare, setReviewModalShare] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchShares = async () => {
    setLoading(true);
    try {
      const [sentRes, incRes] = await Promise.all([
        sharesApi.getSent(),
        sharesApi.getIncoming(),
      ]);

      if (sentRes.success) setSentRequests(sentRes.requests || []);
      if (incRes.success) setIncomingRequests(incRes.requests || []);
    } catch {
      toast.error('Failed to load share requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, []);

  const handleAccept = async (id) => {
    try {
      const res = await sharesApi.accept(id);
      if (res.success) {
        toast.success('Share request accepted!');
        fetchShares();
      }
    } catch {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Provide a brief decline reason:');
    if (reason === null) return;
    try {
      const res = await sharesApi.reject(id, reason);
      if (res.success) {
        toast.success('Share request rejected');
        fetchShares();
      }
    } catch {
      toast.error('Failed to reject request');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await sharesApi.complete(id);
      if (res.success) {
        toast.success('Resource marked as returned/completed!');
        fetchShares();
      }
    } catch {
      toast.error('Failed to complete share request');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await reviewsApi.create({
        shareRequestId: reviewModalShare._id,
        rating,
        comment,
      });
      if (res.success) {
        toast.success('Review submitted successfully!');
        setReviewModalShare(null);
        setComment('');
        fetchShares();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const currentList = activeTab === 'sent' ? sentRequests : incomingRequests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Community Shares & Borrows</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track textbooks, notes, and tools you have requested or shared with other members.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 p-1.5 rounded-2xl glass-card border border-white/10">
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sent'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            My Borrow Requests ({sentRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('incoming')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'incoming'
                ? 'bg-primary-500 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Incoming for My Items ({incomingRequests.length})
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      ) : currentList.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">No Share Requests Found</h2>
          <p className="text-slate-400 text-xs">
            {activeTab === 'sent'
              ? 'When you request to borrow community textbooks or study notes, they will appear here.'
              : 'Requests from other students and members to borrow your shared resources will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((req) => (
            <div
              key={req._id}
              className="glass-card rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === 'ACCEPTED' || req.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : req.status === 'REJECTED' || req.status === 'CANCELLED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {req.status}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                    {req.requestType}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: #{req._id.slice(-6)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white">
                  {req.resource?.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span>
                    {activeTab === 'sent' ? (
                      <>Owner: <strong className="text-primary-400">{req.owner?.name}</strong></>
                    ) : (
                      <>Requester: <strong className="text-primary-400">{req.requester?.name}</strong></>
                    )}
                  </span>
                  <span>Duration: {req.durationDays} Days</span>
                  {req.returnDeadline && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      Due: {new Date(req.returnDeadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {req.notes && (
                  <p className="text-xs text-slate-400 italic bg-black/20 p-2.5 rounded-xl border border-white/5">
                    &ldquo;{req.notes}&rdquo;
                  </p>
                )}
                {req.rejectionReason && (
                  <p className="text-xs text-rose-300 bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20">
                    Decline reason: {req.rejectionReason}
                  </p>
                )}

                {/* Integrated Persistent Request Communication */}
                <div className="pt-2">
                  <RequestCommunication
                    shareRequestId={req._id}
                    otherPartyName={activeTab === 'sent' ? req.owner?.name : req.requester?.name}
                    itemTitle={req.resource?.title}
                    currentStatus={req.status}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {activeTab === 'incoming' && req.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-white transition-colors"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleReject(req._id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                    >
                      Decline
                    </button>
                  </>
                )}

                {req.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleComplete(req._id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Mark Returned / Completed
                  </button>
                )}

                {/* Leave Review Button */}
                {activeTab === 'sent' && req.status === 'COMPLETED' && !req.isReviewed && (
                  <button
                    onClick={() => setReviewModalShare(req)}
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
      {reviewModalShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Review Community Sharer</h3>
            <p className="text-xs text-slate-300">
              Member: {reviewModalShare.owner?.name} ({reviewModalShare.resource?.title})
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Rating
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
                  Comment
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Was the resource helpful and in good condition?"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setReviewModalShare(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="glass-btn-primary py-2 px-5 text-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
