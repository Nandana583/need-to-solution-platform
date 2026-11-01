import { AIService } from '../services/ai.service.js';
import { SpeechService } from '../services/speech.service.js';
import { TTSService } from '../services/tts.service.js';
import { Booking } from '../models/Booking.js';
import { aiConfig } from '../config/ai.config.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

/**
 * GET /api/v1/ai/status
 * Returns whether AI features are enabled and which models are configured.
 */
export const getAIStatus = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'AI configuration status', {
    enabled: aiConfig.enabled,
    models: aiConfig.enabled ? aiConfig.models : null,
    supportedLanguages: aiConfig.supportedLanguages,
    languageNote: aiConfig.languageNote,
  });
});

/**
 * POST /api/v1/ai/extract
 * Body: { text: string }
 * Extracts structured need information from natural language input.
 * Requires authentication.
 */
export const extractNeed = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !String(text).trim()) {
    throw new AppError('text is required', 400, 'MISSING_TEXT');
  }

  if (String(text).length > 2000) {
    throw new AppError('text must be 2000 characters or fewer', 400, 'TEXT_TOO_LONG');
  }

  const extracted = await AIService.extractNeed(String(text).trim());

  if (!extracted) {
    // AI disabled — return a minimal passthrough so the frontend can still proceed
    return sendSuccess(res, 200, 'AI extraction not available; proceeding with raw text', {
      enabled: false,
      originalText: text,
      normalizedDescription: text,
      confidence: 'NONE',
    });
  }

  return sendSuccess(res, 200, 'Need extracted successfully', {
    enabled: true,
    ...extracted,
  });
});

/**
 * POST /api/v1/ai/transcribe
 * Body: multipart/form-data with field "audio" (audio file) and optional "language" (BCP-47 hint)
 * Transcribes audio to text using Whisper.
 * Requires authentication.
 */
export const transcribeAudio = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Audio file is required. Upload as multipart field "audio".', 400, 'MISSING_AUDIO');
  }

  const { language } = req.body; // Optional language hint e.g. 'te', 'en', 'hi'
  const audioBuffer = req.file.buffer;
  const mimeType = req.file.mimetype || 'audio/webm';

  if (audioBuffer.length > aiConfig.maxAudioSizeBytes) {
    throw new AppError('Audio file exceeds the 25 MB limit', 400, 'AUDIO_TOO_LARGE');
  }

  const result = await SpeechService.transcribe(audioBuffer, mimeType, language || null);

  if (result.error && !result.text) {
    return sendSuccess(res, 200, 'Transcription unsuccessful', {
      success: false,
      text: '',
      error: result.error,
      enabled: aiConfig.enabled,
    });
  }

  return sendSuccess(res, 200, 'Audio transcribed successfully', {
    success: true,
    text: result.text,
    detectedLanguage: result.detectedLanguage,
    confidence: result.confidence,
    enabled: aiConfig.enabled,
  });
});

/**
 * POST /api/v1/ai/assist
 * Body: { messages: [{role, content}], context?: object }
 * Conversational AI assistant for requesters and providers.
 * Requires authentication.
 */
export const assist = asyncHandler(async (req, res) => {
  const { messages, context } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new AppError('messages array is required', 400, 'MISSING_MESSAGES');
  }

  // Sanitize messages — only allow expected roles and string content
  const sanitized = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant'))
    .map((m) => ({ role: m.role, content: String(m.content || '').slice(0, 2000) }));

  if (sanitized.length === 0) {
    throw new AppError('No valid messages found', 400, 'INVALID_MESSAGES');
  }

  // Sanitize context — strip any sensitive fields before passing to AI
  let safeContext = {};
  if (context && typeof context === 'object') {
    // Only allow non-sensitive fields
    const allowedKeys = ['needTitle', 'needStatus', 'bookingStatus', 'serviceName', 'requestType', 'urgency', 'locationLabel'];
    for (const key of allowedKeys) {
      if (context[key] !== undefined) {
        safeContext[key] = String(context[key]).slice(0, 200);
      }
    }
  }

  const result = await AIService.assist(sanitized, safeContext);

  return sendSuccess(res, 200, 'Assistant response', {
    reply: result.reply,
    enabled: result.enabled,
  });
});

/**
 * POST /api/v1/ai/tts
 * Body: { text: string } OR { bookingId: string } for auto-generated booking summaries
 * Returns MP3 audio as binary stream.
 * Requires authentication.
 */
export const textToSpeech = asyncHandler(async (req, res) => {
  let textToConvert = '';

  if (req.body.bookingId) {
    // Auto-generate a summary from a real booking record
    const booking = await Booking.findById(req.body.bookingId)
      .populate('service', 'title')
      .populate('requester', 'name')
      .populate('provider', 'name');

    if (!booking) {
      throw new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND');
    }

    // Authorization: only the provider or requester of this booking may request TTS
    const isParty =
      booking.requester?._id?.toString() === req.user._id.toString() ||
      booking.provider?._id?.toString() === req.user._id.toString();

    if (!isParty) {
      throw new AppError('Unauthorized to access this booking', 403, 'FORBIDDEN');
    }

    textToConvert = TTSService.buildProviderSummaryText(booking);
  } else if (req.body.text) {
    const raw = String(req.body.text).trim();
    if (raw.length > 2000) {
      throw new AppError('Text must be 2000 characters or fewer', 400, 'TEXT_TOO_LONG');
    }
    textToConvert = raw;
  } else {
    throw new AppError('Provide either "text" or "bookingId"', 400, 'MISSING_INPUT');
  }

  if (!aiConfig.enabled) {
    throw new AppError('TTS service is not configured', 503, 'AI_DISABLED');
  }

  const audioBuffer = await TTSService.synthesize(textToConvert);

  if (!audioBuffer) {
    throw new AppError('Text-to-speech synthesis failed', 500, 'TTS_FAILED');
  }

  res.set({
    'Content-Type': 'audio/mpeg',
    'Content-Length': audioBuffer.length,
    'Cache-Control': 'no-cache',
    'X-Audio-Format': 'mp3',
  });
  res.end(audioBuffer);
});
