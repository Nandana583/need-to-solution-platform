import React, { useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Loader2, AlertCircle } from 'lucide-react';
import { aiApi } from '../api/aiApi';
import toast from 'react-hot-toast';

/**
 * VoiceSummaryPlayer — plays a TTS audio summary for a booking or custom text.
 * 
 * Audio playback only starts after user interaction (browser autoplay policy).
 * If AI/TTS is not configured, the component renders a read-only text fallback.
 * 
 * Props:
 *   text         — custom text to read aloud
 *   bookingId    — booking ID to auto-generate summary from
 *   summaryText  — fallback text to display when audio is unavailable
 *   compact      — render as icon-only button
 */
const VoiceSummaryPlayer = ({ text, bookingId, summaryText, compact = false }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | playing | error
  const [errorMsg, setErrorMsg] = useState(null);
  const audioRef = useRef(null);
  const audioBlobUrlRef = useRef(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }
  }, []);

  const handlePlay = async () => {
    if (status === 'loading') return;

    // If already playing, stop
    if (status === 'playing') {
      cleanup();
      setStatus('idle');
      return;
    }

    setStatus('loading');
    setErrorMsg(null);

    try {
      let blobUrl;
      if (bookingId) {
        blobUrl = await aiApi.bookingTTS(bookingId);
      } else if (text) {
        blobUrl = await aiApi.textToSpeech(text);
      } else {
        setStatus('error');
        setErrorMsg('No text provided for voice playback.');
        return;
      }

      audioBlobUrlRef.current = blobUrl;

      const audio = new Audio(blobUrl);
      audioRef.current = audio;

      audio.onended = () => {
        cleanup();
        setStatus('idle');
      };

      audio.onerror = () => {
        cleanup();
        setStatus('error');
        setErrorMsg('Audio playback failed. Please try again.');
      };

      await audio.play();
      setStatus('playing');
    } catch (err) {
      cleanup();
      const msg = err?.response?.data?.error?.message || err?.message || 'TTS unavailable';
      if (msg.includes('AI_DISABLED') || msg.includes('not configured')) {
        setStatus('error');
        setErrorMsg('Voice feature requires AI configuration. Reading the text below.');
      } else {
        setStatus('error');
        setErrorMsg('Voice playback failed. Please read the summary below.');
        toast.error('Voice playback failed');
      }
    }
  };

  const isLoading = status === 'loading';
  const isPlaying = status === 'playing';
  const isError = status === 'error';

  if (compact) {
    return (
      <button
        type="button"
        onClick={handlePlay}
        disabled={isLoading}
        title={isPlaying ? 'Stop voice summary' : 'Play voice summary'}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
          isPlaying
            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
            : isError
            ? 'bg-red-500/10 text-red-500 border border-red-500/30'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-emerald-500/10 hover:text-emerald-600 border border-[var(--border-subtle)]'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="w-4 h-4" />
        ) : isError ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePlay}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
          isPlaying
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
            : isError
            ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-700 dark:hover:text-emerald-300'
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="w-4 h-4" />
        ) : isError ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        <span>
          {isLoading ? 'Loading voice...' : isPlaying ? 'Stop voice summary' : isError ? 'Voice unavailable' : 'Hear this summary'}
        </span>
      </button>

      {isError && errorMsg && (
        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0 text-amber-500" />
          {errorMsg}
        </p>
      )}

      {summaryText && isError && (
        <div className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
          {summaryText}
        </div>
      )}
    </div>
  );
};

export default VoiceSummaryPlayer;
