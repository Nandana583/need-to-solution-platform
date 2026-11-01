import { useState, useRef, useCallback, useEffect } from 'react';
import { aiApi } from '../api/aiApi';

/**
 * useSpeechInput — voice recording hook for Solvenera.
 * 
 * Strategy:
 * 1. Primary: Browser Web Speech API (SpeechRecognition) — zero latency, supports Telugu in Chrome/Edge.
 * 2. Fallback: MediaRecorder + OpenAI Whisper API — more accurate for Telugu, works cross-browser.
 * 
 * States: idle | requesting-permission | recording | processing | done | error
 */

const RECORDING_MAX_MS = 60000; // 60 second max recording

export function useSpeechInput({ onTranscript, language = null }) {
  const [state, setState] = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [detectedLanguage, setDetectedLanguage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopRecording();
    };
  }, []);

  const safeSetState = useCallback((s) => {
    if (isMountedRef.current) setState(s);
  }, []);

  // ── Browser Web Speech API path ──
  const startBrowserSpeech = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return false; // Not supported

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    // Configure language — try Telugu first, fallback to default
    // BCP-47 codes: 'te-IN' (Telugu), 'en-IN' (English India), 'hi-IN' (Hindi)
    const langCode = language || 'te-IN';
    recognition.lang = langCode;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => safeSetState('recording');

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      if (isMountedRef.current) {
        setTranscript(result);
        setDetectedLanguage(langCode.split('-')[0]);
        safeSetState('done');
        if (onTranscript) onTranscript(result, langCode.split('-')[0]);
      }
    };

    recognition.onerror = (event) => {
      // On recognition error, fall through to Whisper recording
      console.warn('[useSpeechInput] Web Speech API error:', event.error, '— falling back to Whisper');
      if (isMountedRef.current) {
        recognitionRef.current = null;
        startWhisperRecording(); // Graceful fallback
      }
    };

    recognition.onnomatch = () => {
      if (isMountedRef.current) {
        setError('Could not understand the speech. Please try again.');
        safeSetState('error');
      }
    };

    try {
      recognition.start();
      return true;
    } catch {
      return false;
    }
  }, [language, onTranscript, safeSetState]);

  // ── Whisper API (MediaRecorder) path ──
  const startWhisperRecording = useCallback(async () => {
    try {
      safeSetState('requesting-permission');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      audioChunksRef.current = [];

      // Pick best supported MIME type
      const mimeType =
        MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearTimeout(recordingTimerRef.current);

        if (!isMountedRef.current) return;

        if (audioChunksRef.current.length === 0) {
          setError('No audio recorded. Please try again.');
          safeSetState('error');
          return;
        }

        safeSetState('processing');

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType.split(';')[0] });

        try {
          const result = await aiApi.transcribeAudio(
            audioBlob,
            mimeType.split(';')[0],
            language || null
          );

          if (!isMountedRef.current) return;

          if (result?.data?.text) {
            const text = result.data.text;
            setTranscript(text);
            setDetectedLanguage(result.data.detectedLanguage || 'unknown');
            safeSetState('done');
            if (onTranscript) onTranscript(text, result.data.detectedLanguage || 'unknown');
          } else {
            setError(result?.data?.error || 'Could not transcribe audio. Please try again.');
            safeSetState('error');
          }
        } catch (err) {
          if (!isMountedRef.current) return;
          setError('Transcription failed. Check your connection and try again.');
          safeSetState('error');
        }
      };

      mediaRecorder.start(250); // Collect data every 250ms
      safeSetState('recording');

      // Auto-stop after max recording duration
      recordingTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, RECORDING_MAX_MS);
    } catch (err) {
      if (!isMountedRef.current) return;
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else {
        setError('Could not access microphone. Please try again.');
      }
      safeSetState('error');
    }
  }, [language, onTranscript, safeSetState]);

  const startRecording = useCallback(async () => {
    if (state === 'recording' || state === 'processing') return;

    setError(null);
    setTranscript('');
    setDetectedLanguage(null);

    // Try browser Web Speech API first (faster, no upload)
    const webSpeechStarted = startBrowserSpeech();
    if (!webSpeechStarted) {
      // Web Speech API unavailable — go directly to Whisper
      await startWhisperRecording();
    }
  }, [state, startBrowserSpeech, startWhisperRecording]);

  const stopRecording = useCallback(() => {
    clearTimeout(recordingTimerRef.current);

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    stopRecording();
    setTranscript('');
    setError(null);
    setDetectedLanguage(null);
    safeSetState('idle');
  }, [stopRecording, safeSetState]);

  return {
    state,        // 'idle'|'requesting-permission'|'recording'|'processing'|'done'|'error'
    transcript,
    error,
    detectedLanguage,
    isRecording: state === 'recording',
    isProcessing: state === 'processing',
    startRecording,
    stopRecording,
    reset,
  };
}
