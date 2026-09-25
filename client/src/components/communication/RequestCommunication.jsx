import React, { useState, useEffect, useRef } from 'react';
import { messagesApi } from '../../api/messagesApi';
import { useAuth } from '../../hooks/useAuth';
import {
  Send,
  Loader2,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RequestCommunication = ({
  bookingId,
  shareRequestId,
  otherPartyName,
  itemTitle,
  currentStatus,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isOthersOpen, setIsOthersOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await messagesApi.getMessages({
        bookingId: bookingId || undefined,
        shareRequestId: shareRequestId || undefined,
      });
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch {
      // Non-blocking error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [bookingId, shareRequestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  // Structured action suggestions dynamically tailored to status and context
  const getContextualSuggestions = () => {
    if (currentStatus === 'PENDING') {
      return [
        { label: "Available today", text: "I am available today for this request." },
        { label: "Available tomorrow", text: "I can take care of this tomorrow." },
        { label: "Share exact location", text: "Could you please share your exact address / landmark?" },
        { label: "Need 1 hour", text: "This will require approximately 1 hour to complete." },
        { label: "Need more details", text: "Could you share additional details about the issue?" },
      ];
    }
    if (currentStatus === 'ACCEPTED' || currentStatus === 'IN_PROGRESS') {
      return [
        { label: "On my way", text: "I am on my way to the location now." },
        { label: "Arrived", text: "I have arrived at the location." },
        { label: "Estimated 30 mins", text: "I expect to complete this in about 30 minutes." },
        { label: "Ready for pickup", text: "The item is ready for pickup." },
        { label: "All done", text: "The task is finished. Please verify and mark completed!" },
      ];
    }
    if (currentStatus === 'COMPLETED') {
      return [
        { label: "Thank you!", text: "Thank you for coordinating! Service completed successfully." },
        { label: "Review left", text: "I have submitted a review. Thank you!" },
        { label: "Need assistance", text: "Feel free to reach out if any further assistance is needed." },
      ];
    }
    return [
      { label: "I'm available", text: "I'm available to coordinate on this request." },
      { label: "Confirm timing", text: "Let's confirm the preferred time." },
      { label: "Confirm location", text: "Please confirm the location address." },
    ];
  };

  const quickSuggestions = getContextualSuggestions();

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-4 sm:p-6 flex flex-col space-y-4 bg-slate-900/60">
      {/* Communication Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Coordination with {otherPartyName || 'Participant'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {itemTitle} • Status: <span className="text-emerald-400 font-semibold">{currentStatus}</span>
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
          Request-Specific Communication
        </span>
      </div>

      {/* Message History */}
      <div className="min-h-[160px] max-h-[260px] overflow-y-auto space-y-2.5 pr-2">
        {loading && messages.length === 0 ? (
          <div className="py-8 flex justify-center items-center text-xs text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-400" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No messages yet. Use the quick action buttons below or write a note to coordinate timing and location.
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender?._id === user?.id || m.sender?._id === user?._id || m.sender === user?.id;
            return (
              <div
                key={m._id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-none shadow-md'
                      : 'bg-white/10 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p>{m.content}</p>
                  <div
                    className={`text-[9px] mt-1 text-right ${
                      isMe ? 'text-blue-200' : 'text-slate-400'
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

      {/* Automated Suggestion Buttons */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Quick Responses:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickSuggestions.map((q, idx) => (
            <button
              key={idx}
              disabled={sending}
              onClick={() => handleSend(q.text, 'SUGGESTION_ACTION')}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all active:scale-95 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
          <button
            onClick={() => setIsOthersOpen(!isOthersOpen)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-medium transition-all ${
              isOthersOpen
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 border border-white/10 text-blue-300'
            }`}
          >
            Others...
          </button>
        </div>
      </div>

      {/* "Others" Free-text Modal / Inline Composer */}
      {isOthersOpen && (
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2 animate-fade-in">
          <label className="block text-[11px] font-semibold text-slate-300">
            Anything else you would like to tell {otherPartyName}?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend(customText, 'TEXT');
              }}
            />
            <button
              onClick={() => handleSend(customText, 'TEXT')}
              disabled={sending || !customText.trim()}
              className="glass-btn-primary px-4 py-2 text-xs flex items-center gap-1 shrink-0"
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
