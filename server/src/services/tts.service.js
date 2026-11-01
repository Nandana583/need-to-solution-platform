import { aiConfig } from '../config/ai.config.js';

/**
 * TTSService — converts text to audio using OpenAI TTS-1.
 * 
 * Voice quality: TTS-1 supports multilingual text including Telugu script and
 * Telugu-English mixed content. The "alloy" voice is neutral and clear.
 * 
 * Note: Telugu pronunciation quality varies. Plain text in English or
 * transliterated Telugu produces the most reliable results.
 * Telugu Unicode script is supported but pronunciation may not be perfect.
 */
export class TTSService {
  /**
   * Convert text to speech.
   * @param {string} text - Text to convert (max ~4096 characters for TTS-1)
   * @param {string} voice - Voice to use (default: aiConfig.ttsVoice)
   * @returns {Buffer|null} - MP3 audio buffer, or null on failure
   */
  static async synthesize(text, voice = null) {
    if (!aiConfig.enabled) {
      return null;
    }

    const trimmed = (text || '').trim();
    if (!trimmed) return null;

    // Truncate to safe length (TTS-1 limit is ~4096 chars)
    const safeText = trimmed.slice(0, 4096);
    const selectedVoice = voice || aiConfig.ttsVoice;

    try {
      const mp3Response = await Promise.race([
        aiConfig.client.audio.speech.create({
          model: aiConfig.models.tts,
          voice: selectedVoice,
          input: safeText,
          response_format: 'mp3',
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('TTS timeout')), aiConfig.timeoutMs)
        ),
      ]);

      // Convert response to Buffer
      const arrayBuffer = await mp3Response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      console.error('[TTS Service] Synthesis error:', err.message);
      return null;
    }
  }

  /**
   * Generate a provider notification voice summary for a booking.
   * Uses only verified, real data from the booking object.
   */
  static buildProviderSummaryText(booking) {
    const serviceName = booking.service?.title || 'the requested service';
    const requesterName = booking.requester?.name || 'a requester';
    const locationLabel = booking.locationLabel || 'the location they provided';
    const scheduledDate = booking.scheduledDate
      ? new Date(booking.scheduledDate).toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      : null;
    const notes = booking.notes ? ` They added the following note: ${booking.notes.slice(0, 200)}.` : '';

    const dateClause = scheduledDate ? ` for ${scheduledDate}` : '';

    return (
      `You have a new service request from ${requesterName} for ${serviceName}${dateClause}. ` +
      `The service location is ${locationLabel}.` +
      notes +
      ` Please review the booking details and decide whether you can provide this service.`
    );
  }
}
