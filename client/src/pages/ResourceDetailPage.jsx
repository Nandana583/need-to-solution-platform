import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resourcesApi } from '../api/resourcesApi';
import { sharesApi } from '../api/sharesApi';
import {
  BookOpen,
  User,
  MapPin,
  Clock,
  Share2,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ResourceDetailPage = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request Share Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [durationDays, setDurationDays] = useState(14);
  const [message, setMessage] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    const loadResource = async () => {
      try {
        const res = await resourcesApi.getById(id);
        if (res.success) {
          setResource(res.resource);
        }
      } catch (err) {
        toast.error('Failed to load resource details');
      } finally {
        setLoading(false);
      }
    };
    loadResource();
  }, [id]);

  const handleSendRequest = async () => {
    setRequestLoading(true);
    try {
      const res = await sharesApi.create({
        resourceId: resource._id,
        durationDays,
        message: message || `Hi ${resource.owner?.name}, I would love to borrow/share "${resource.title}".`,
      });
      if (res.success) {
        toast.success('Share request sent to resource owner!');
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send share request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center glass-card p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">Resource Not Found</h2>
        <Link to="/resources" className="glass-btn-primary text-xs inline-flex mt-4">
          Browse Community Resources
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/resources"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Resources</span>
      </Link>

      {/* Main Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-primary-500/20 bg-primary-950/10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30">
                {resource.category?.name}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {resource.shareType}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {resource.title}
            </h1>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="glass-btn-primary py-2.5 px-6 text-sm flex items-center gap-2 shadow-lg shadow-primary-500/25"
          >
            <Share2 className="w-4 h-4" />
            <span>Request to Borrow / Share</span>
          </button>
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Author</span>
            <span className="font-semibold text-white">{resource.metadata?.author || 'Not specified'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Subject / Course</span>
            <span className="font-semibold text-white">{resource.metadata?.subject || 'General'}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Item Condition</span>
            <span className="font-semibold text-emerald-400">{resource.condition}</span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Availability</span>
            <span className="font-semibold text-primary-300">{resource.availabilityStatus}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Resource Description
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {resource.description}
          </p>
        </div>

        {/* Owner Card */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-sm text-white">
              {resource.owner?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-xs text-slate-400">Shared by Community Member</p>
              <h4 className="text-sm font-bold text-white">{resource.owner?.name}</h4>
            </div>
          </div>

          {resource.locationLabel && (
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary-400" />
              {resource.locationLabel}
            </span>
          )}
        </div>
      </div>

      {/* Share Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-white/15 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Request to Borrow Resource</h3>
            <p className="text-xs text-primary-400 font-semibold">{resource.title}</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  How many days do you need this?
                </label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message for {resource.owner?.name}
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, your semester or college, and when you can pick it up..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                disabled={requestLoading}
                className="glass-btn-primary py-2 px-5 text-xs"
              >
                {requestLoading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
