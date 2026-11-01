import React from 'react';
import { Mic, MicOff, Loader2, CheckCircle, AlertCircle, Square } from 'lucide-react';

/**
 * VoiceInputButton — reusable microphone button with visual state feedback.
 * 
 * States rendered:
 *   idle           → grey mic icon, "Speak in Telugu or English"
 *   requesting-permission → pulsing, waiting for mic access
 *   recording      → red pulsing ring, "Recording... tap to stop"
 *   processing     → spinner, "Processing..."
 *   done           → green check, transcript shown
 *   error          → red alert, error message
 */
const VoiceInputButton = ({
  state = 'idle',
  error = null,
  detectedLanguage = null,
  transcript = '',
  onStart,
  onStop,
  onReset,
  disabled = false,
  compact = false,
}) => {
  const isIdle = state === 'idle';
  const isRequesting = state === 'requesting-permission';
  const isRecording = state === 'recording';
  const isProcessing = state === 'processing';
  const isDone = state === 'done';
  const isError = state === 'error';
  const isActive = isRecording || isProcessing || isRequesting;

  const handleClick = () => {
    if (disabled) return;
    if (isRecording) { onStop?.(); return; }
    if (isDone || isError) { onReset?.(); return; }
    if (isIdle) { onStart?.(); return; }
  };

  // Button appearance
  let btnClass = 'relative flex items-center gap-2 rounded-2xl font-semibold transition-all duration-200 select-none ';
  let iconEl;
  let label;

  if (compact) {
    btnClass += 'px-3 py-2 text-xs ';
  } else {
    btnClass += 'px-4 py-3 text-sm ';
  }

  if (isIdle) {
    btnClass += 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer';
    iconEl = <Mic className={compact ? 'w-4 h-4' : 'w-5 h-5'} />;
    label = compact ? 'Voice' : 'Speak your need';
  } else if (isRequesting) {
    btnClass += 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 cursor-wait';
    iconEl = <Loader2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />;
    label = 'Requesting mic...';
  } else if (isRecording) {
    btnClass += 'bg-red-500/15 border border-red-500/40 text-red-700 dark:text-red-400 cursor-pointer shadow-lg shadow-red-500/20';
    iconEl = (
      <span className="relative flex">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
        <Square className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} relative fill-current`} />
      </span>
    );
    label = 'Recording — tap to stop';
  } else if (isProcessing) {
    btnClass += 'bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 cursor-wait';
    iconEl = <Loader2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} animate-spin`} />;
    label = 'Transcribing...';
  } else if (isDone) {
    btnClass += 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-500/20';
    iconEl = <CheckCircle className={compact ? 'w-4 h-4' : 'w-5 h-5'} />;
    label = compact ? 'Done — tap to redo' : 'Transcribed — tap to redo';
  } else if (isError) {
    btnClass += 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 cursor-pointer hover:bg-red-500/20';
    iconEl = <AlertCircle className={compact ? 'w-4 h-4' : 'w-5 h-5'} />;
    label = 'Error — tap to retry';
  }

  if (disabled) {
    btnClass += ' opacity-50 cursor-not-allowed';
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isRequesting || isProcessing}
        className={btnClass}
        aria-label={label}
        title={label}
      >
        {iconEl}
        {!compact && <span>{label}</span>}
        {compact && isRecording && (
          <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
        )}
      </button>

      {/* Error message */}
      {isError && error && !compact && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 px-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}

      {/* Language detected badge */}
      {isDone && detectedLanguage && !compact && (
        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 px-1 font-medium">
          Detected: {detectedLanguage.toUpperCase()} · Tap the button above to re-record
        </p>
      )}

      {/* Language hint */}
      {isIdle && !compact && (
        <p className="text-[10px] text-[var(--text-muted)] px-1">
          Speak in Telugu, Telugu-English, or English · Works best in Chrome/Edge
        </p>
      )}
    </div>
  );
};

export default VoiceInputButton;
