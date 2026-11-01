import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Loader2, ChevronDown, ChevronUp, Volume2 } from 'lucide-react';
import { aiApi } from '../api/aiApi';
import { useAuth } from '../hooks/useAuth';
import VoiceInputButton from './VoiceInputButton';
import { useSpeechInput } from '../hooks/useSpeechInput';

/**
 * AIAssistant — floating context-aware AI assistant panel.
 * 
 * Appears as a collapsible panel. Requester and provider versions pass
 * different context objects to tailor the AI responses.
 * 
 * Props:
 *   context      — object with safe context fields (needTitle, bookingStatus, etc.)
 *   placeholder  — input placeholder text
 *   title        — panel header title
 */
const AIAssistant = ({
  context = {},
  placeholder = 'Ask me anything about your request...',
  title = 'Solvenera AI Assistant',
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { state: voiceState, transcript, error: voiceError, startRecording, stopRecording, reset: resetVoice } = useSpeechInput({
    onTranscript: (text) => setInput((prev) => prev ? `${prev} ${text}` : text),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = user?.name
        ? `Hi ${user.name.split(' ')[0]}! I'm your Solvenera assistant. How can I help you today?`
        : `Hi! I'm your Solvenera assistant. How can I help you today?`;
      setMessages([{ role: 'assistant', content: greeting }]);
    }
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.assist(
        updatedMessages.slice(-10), // Send last 10 messages only
        context
      );

      if (!response?.data?.enabled && !response?.data?.reply) {
        setAiEnabled(false);
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'AI assistant is not available right now. Please contact support.' },
        ]);
        return;
      }

      const reply = response?.data?.reply || 'I could not generate a response. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errMsg =
        err?.response?.data?.error?.message ||
        'I am temporarily unavailable. Please try again in a moment.';
      setMessages((prev) => [...prev, { role: 'assistant', content: errMsg, isError: true }]);
    } finally {
      setLoading(false);
    }
  }, [input, messages, loading, context]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReadAloud = async (text) => {
    try {
      const url = await aiApi.textToSpeech(text);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      await audio.play();
    } catch {
      // Silent fail — TTS not configured
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div className="glass-card rounded-3xl border border-[var(--border-medium)] shadow-2xl w-[340px] sm:w-[380px] flex flex-col overflow-hidden animate-fade-in"
             style={{ maxHeight: '520px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-tertiary)]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-[var(--text-primary)]">{title}</span>
              {!aiEnabled && (
                <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full">
                  Limited
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: '320px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed relative group ${
                    msg.role === 'user'
                      ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-100 border border-emerald-500/25'
                      : msg.isError
                      ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                  }`}
                >
                  {msg.content}
                  {msg.role === 'assistant' && !msg.isError && (
                    <button
                      onClick={() => handleReadAloud(msg.content)}
                      className="opacity-0 group-hover:opacity-100 absolute -top-2 -right-2 w-5 h-5 bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] rounded-full flex items-center justify-center transition-opacity"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-subtle)] px-3 py-2 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[var(--border-subtle)] p-3 space-y-2 bg-[var(--bg-secondary)]">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={2}
                maxLength={500}
                className="flex-1 resize-none text-xs px-3 py-2 rounded-xl glass-input"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Voice input row */}
            <div className="flex items-center justify-between">
              <VoiceInputButton
                state={voiceState}
                error={voiceError}
                transcript={transcript}
                onStart={startRecording}
                onStop={stopRecording}
                onReset={resetVoice}
                compact
              />
              <span className="text-[10px] text-[var(--text-faint)]">Press Enter to send</span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm shadow-xl transition-all duration-300 ${
          isOpen
            ? 'bg-[var(--bg-tertiary)] border border-[var(--border-medium)] text-[var(--text-secondary)]'
            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/30'
        }`}
        title={isOpen ? 'Close AI assistant' : 'Open AI assistant'}
      >
        <Sparkles className="w-4 h-4" />
        <span>{isOpen ? 'Close' : 'AI Help'}</span>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default AIAssistant;
