import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../api/messagesApi';
import { abuseApi } from '../../api/abuseApi';
import { useAuth } from '../../hooks/useAuth';
import {
  Send,
  Loader2,
  MessageSquare,
  Sparkles,
  ChevronDown,
  Flag,
  X,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * RequestCommunication — Task-oriented coordination panel
 * Uses real backend messages via messagesApi. No mock data.
 */
export const RequestCommunication = ({
  bookingId,
  shareRequestId,
  otherPartyName,
  otherPartyId,
  itemTitle,
  currentStatus,
}) => {
  const { user } = useAuth();
  const [messages, setMessages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [sending, setSending]         = useState(false);
  const [customText, setCustomText]   = useState('');
  const [isOthersOpen, setIsOthersOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('SPAM');
  const [reportDetails, setReportDetails] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const messagesEndRef                = useRef(null);
  const inputRef                      = useRef(null);

  /* ── Fetch messages ── */
  const fetchMessages = async () => {
    try {
      const res = await messagesApi.getMessages({
        bookingId: bookingId || undefined,
        shareRequestId: shareRequestId || undefined,
      });
      if (res.success) setMessages(res.messages || []);
    } catch {
      // Non-blocking
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [bookingId, shareRequestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Report/Block handler ── */
  const handleReport = async (isBlock = false) => {
    setReportLoading(true);
    try {
      await abuseApi.fileReport({
        reportedUserId: otherPartyId,
        reason: reportReason,
        details: reportDetails.trim().slice(0, 500),
        bookingId: bookingId || undefined,
        shareRequestId: shareRequestId || undefined,
        isBlock,
      });
      toast.success(isBlock ? `${otherPartyName} blocked and report filed` : 'Report submitted. Our team will review it.');
      setShowReportModal(false);
      setReportDetails('');
    } catch (err) {
      toast.error(err?.response?.data?.error?.message || 'Failed to submit report');
    } finally {
      setReportLoading(false);
    }
  };

  /* ── Send handler ── */
  const handleSend = async (content, messageType = 'TEXT') => {
    if (!content.trim()) return;
    setSending(true);
    try {
      const res = await messagesApi.sendMessage({
        bookingId: bookingId || undefined,
        shareRequestId: shareRequestId || undefined,
        content: content.trim(),
        messageType,
      });
      if (res.success) {
        setMessages((prev) => [...prev, res.message]);
        setCustomText('');
        setIsOthersOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  /* ── Contextual suggestions based on status ── */
  const getContextualSuggestions = () => {
    if (currentStatus === 'PENDING') {
      return [
        { label: 'Available today',     text: 'I am available today for this request.' },
        { label: 'Available tomorrow',  text: 'I can take care of this tomorrow.' },
        { label: 'Share location',      text: 'Could you please share your exact address or landmark?' },
        { label: 'Need ~1 hour',        text: 'This will take approximately 1 hour to complete.' },
        { label: 'Need more details',   text: 'Could you share additional details about the issue?' },
      ];
    }
    if (currentStatus === 'ACCEPTED' || currentStatus === 'IN_PROGRESS') {
      return [
        { label: 'On my way',           text: 'I am on my way to the location now.' },
        { label: 'Arrived',             text: 'I have arrived at the location.' },
        { label: '~30 mins to finish',  text: 'I expect to complete this in about 30 minutes.' },
        { label: 'Ready for pickup',    text: 'The item is ready for pickup.' },
        { label: 'All done!',           text: 'The task is finished. Please verify and mark as completed!' },
      ];
    }
    if (currentStatus === 'COMPLETED') {
      return [
        { label: 'Thank you!',          text: 'Thank you for the coordination! Service completed successfully.' },
        { label: 'Review submitted',    text: 'I have submitted a review. Thank you for the service!' },
        { label: 'Reach out anytime',   text: 'Feel free to reach out if any further assistance is needed.' },
      ];
    }
    return [
      { label: "I'm available",         text: "I'm available to coordinate on this request." },
      { label: 'Confirm timing',        text: 'Let\'s confirm the preferred time.' },
      { label: 'Confirm location',      text: 'Please confirm the exact location address.' },
    ];
  };

  const quickSuggestions = getContextualSuggestions();

  /* ── Determine if message is from current user ── */
  const isMyMessage = (m) =>
    m.sender?._id === user?.id ||
    m.sender?._id === user?._id ||
    m.sender === user?.id;

  /* ── Status color ── */
  const statusColor = {
    PENDING:     'text-amber-600 dark:text-amber-400',
    ACCEPTED:    'text-emerald-600 dark:text-emerald-400',
    IN_PROGRESS: 'text-teal-600 dark:text-teal-400',
    COMPLETED:   'text-[var(--text-muted)] dark:text-[var(--text-secondary)]',
    CANCELLED:   'text-rose-600 dark:text-rose-400',
  }[currentStatus] || 'text-[var(--text-muted)]';

  return (
    <div className="glass-card rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col relative">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-[var(--text-primary)] truncate">
              Coordination with {otherPartyName || 'Participant'}
            </h3>
            <p className="text-[10px] text-[var(--text-muted)] truncate">
              {itemTitle && <span className="text-[var(--text-secondary)]">{itemTitle}</span>}
              {itemTitle && currentStatus && ' · '}
              {currentStatus && (
                <span className={`font-semibold ${statusColor}`}>{currentStatus.replace('_', ' ')}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-muted)] font-medium hidden sm:inline">
            Task Coordination
          </span>
          {otherPartyId && (
            <button
              onClick={() => setShowReportModal(true)}
              title={`Report or block ${otherPartyName || 'this user'}`}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Message History ── */}
      <div className="min-h-[180px] max-h-[280px] overflow-y-auto space-y-2.5 p-4 flex-1">
        {loading && messages.length === 0 ? (
          <div className="py-8 flex justify-center items-center">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600 dark:text-emerald-400 mr-2" />
            <span className="text-xs text-[var(--text-muted)]">Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/8 dark:border-white/8 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
            <p className="text-xs font-medium text-[var(--text-secondary)]">No messages yet</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-1 max-w-xs mx-auto leading-relaxed">
              Use the quick action buttons below or write a note to coordinate timing and location.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = isMyMessage(m);
            return (
              <div
                key={m._id}
                className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[72%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    mine
                      ? 'text-white rounded-tr-none'
                      : 'bg-black/[0.04] dark:bg-white/[0.08] border border-black/[0.05] dark:border-white/[0.08] text-[var(--text-primary)] rounded-tl-none'
                  }`}
                  style={mine ? {
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                    boxShadow: '0 2px 8px -2px rgba(5,150,105,0.3)',
                  } : {}}
                >
                  <p>{m.content}</p>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      mine ? 'text-emerald-100/80' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Quick Action Suggestions ── */}
      <div className="px-4 pt-3 pb-3 border-t border-black/5 dark:border-white/10 bg-black/[0.01] dark:bg-white/[0.01] space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
          <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">Quick Responses:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickSuggestions.map((q, idx) => (
            <button
              key={idx}
              disabled={sending}
              onClick={() => handleSend(q.text, 'SUGGESTION_ACTION')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-black/[0.04] dark:bg-white/[0.05] hover:bg-emerald-500/10 border border-black/8 dark:border-white/8 hover:border-emerald-500/25 text-[var(--text-secondary)] hover:text-emerald-700 dark:hover:text-emerald-300 transition-all active:scale-95 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
          <button
            onClick={() => {
              setIsOthersOpen(!isOthersOpen);
              if (!isOthersOpen) setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
              isOthersOpen
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-black/[0.04] dark:bg-white/[0.05] border border-black/8 dark:border-white/8 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/25'
            }`}
          >
            Others…
          </button>
        </div>
      </div>

      {/* ── Custom Message Input ── */}
      {isOthersOpen && (
        <div className="px-4 pb-4 animate-fade-down">
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.05] dark:border-white/[0.07] space-y-2">
            <label className="block text-[11px] font-semibold text-[var(--text-secondary)]">
              Write a custom message to {otherPartyName || 'the other party'}:
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your message…"
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(customText, 'TEXT');
                  }
                }}
              />
              <button
                onClick={() => handleSend(customText, 'TEXT')}
                disabled={sending || !customText.trim()}
                className="glass-btn-primary px-3.5 py-2 text-xs shrink-0"
              >
                {sending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Send className="w-3.5 h-3.5" />
                }
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report / Block Modal ── */}
      {showReportModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl p-4">
          <div className="glass-card w-full max-w-sm rounded-2xl border border-red-500/20 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-[var(--text-primary)]">Report {otherPartyName || 'User'}</span>
              </div>
              <button onClick={() => setShowReportModal(false)} className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Reason *</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="SPAM">Spam / Unsolicited messages</option>
                  <option value="HARASSMENT">Harassment or threatening behaviour</option>
                  <option value="INAPPROPRIATE_CONTENT">Inappropriate content</option>
                  <option value="FAKE_PROFILE">Fake or misleading profile</option>
                  <option value="FRAUD">Fraud or scam attempt</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">Details (optional)</label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe what happened..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => handleReport(false)}
                disabled={reportLoading}
                className="flex-1 py-2 rounded-xl text-xs font-semibold border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
              >
                {reportLoading ? 'Submitting...' : 'Report Only'}
              </button>
              <button
                onClick={() => handleReport(true)}
                disabled={reportLoading}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-50"
              >
                {reportLoading ? 'Submitting...' : 'Report & Block'}
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] text-center">Reports are reviewed by our moderation team. Blocks are immediate.</p>
          </div>
        </div>
      )}
    </div>
  );
};
