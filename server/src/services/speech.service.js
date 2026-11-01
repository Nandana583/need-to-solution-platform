import { aiConfig } from '../config/ai.config.js';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { writeFile } from 'fs/promises';

/**
 * SpeechService — converts audio buffers to text using OpenAI Whisper.
 * 
 * Language support: Whisper supports 99 languages including Telugu, Hindi, Tamil, and English.
 * Telugu-English code-switching is handled naturally by Whisper.
 * 
 * Limitations:
 * - Maximum audio file size: 25 MB (OpenAI limit)
 * - Supported formats: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
 * - Language hint can be provided to improve accuracy for short utterances
 */
export class SpeechService {
  /**
   * Transcribe audio buffer to text.
   * @param {Buffer} audioBuffer - Raw audio data
   * @param {string} mimeType - Audio MIME type (e.g., 'audio/webm', 'audio/wav')
   * @param {string} languageHint - Optional BCP-47 language code hint (e.g., 'te' for Telugu, 'en' for English)
   * @returns {{ text: string, detectedLanguage: string, confidence: string }}
   */
  static async transcribe(audioBuffer, mimeType = 'audio/webm', languageHint = null) {
    if (!aiConfig.enabled) {
      return {
        text: '',
        detectedLanguage: 'unknown',
        confidence: 'NONE',
        error: 'AI features not configured',
      };
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return { text: '', error: 'Empty audio buffer', confidence: 'NONE' };
    }

    if (audioBuffer.length > aiConfig.maxAudioSizeBytes) {
      return { text: '', error: 'Audio file too large (max 25 MB)', confidence: 'NONE' };
    }

    // Determine file extension from MIME type
    const extMap = {
      'audio/webm': 'webm',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/mp4': 'mp4',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/flac': 'flac',
    };
    const ext = extMap[mimeType] || 'webm';

    // Write buffer to a temp file (OpenAI SDK requires a file stream)
    const tmpFileName = `solvenera_audio_${crypto.randomUUID()}.${ext}`;
    const tmpFilePath = path.join(os.tmpdir(), tmpFileName);

    try {
      await writeFile(tmpFilePath, audioBuffer);

      const transcriptionParams = {
        model: aiConfig.models.stt,
        file: createReadStream(tmpFilePath),
        response_format: 'verbose_json', // Includes language detection
      };

      // Add language hint if provided (improves accuracy for short clips)
      if (languageHint) {
        transcriptionParams.language = languageHint;
      }

      const response = await Promise.race([
        aiConfig.client.audio.transcriptions.create(transcriptionParams),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('STT timeout')), aiConfig.timeoutMs)
        ),
      ]);

      return {
        text: (response.text || '').trim(),
        detectedLanguage: response.language || 'unknown',
        confidence: 'HIGH',
      };
    } catch (err) {
      console.error('[Speech Service] Transcription error:', err.message);
      return {
        text: '',
        detectedLanguage: 'unknown',
        confidence: 'NONE',
        error: err.message?.includes('timeout') ? 'Transcription timed out' : 'Transcription failed',
      };
    } finally {
      // Clean up temp file
      unlink(tmpFilePath).catch(() => {});
    }
  }
}
