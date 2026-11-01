import { axiosInstance } from './axiosInstance';

/**
 * Client-side API for the AI endpoints.
 * All endpoints degrade gracefully when AI is not configured on the server.
 */
export const aiApi = {
  /**
   * Get AI feature status (no auth required)
   */
  getStatus: async () => {
    const res = await axiosInstance.get('/ai/status');
    return res.data;
  },

  /**
   * Extract structured need from natural language text.
   * @param {string} text - Raw user input (any supported language)
   */
  extractNeed: async (text) => {
    const res = await axiosInstance.post('/ai/extract', { text });
    return res.data;
  },

  /**
   * Transcribe audio blob to text via Whisper.
   * @param {Blob} audioBlob - Recorded audio
   * @param {string} mimeType - e.g. 'audio/webm'
   * @param {string|null} language - Optional BCP-47 language hint e.g. 'te', 'en'
   */
  transcribeAudio: async (audioBlob, mimeType = 'audio/webm', language = null) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, `recording.${mimeType.split('/')[1] || 'webm'}`);
    if (language) formData.append('language', language);

    const res = await axiosInstance.post('/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000, // 60s for audio upload
    });
    return res.data;
  },

  /**
   * AI assistant conversational endpoint.
   * @param {Array<{role: string, content: string}>} messages
   * @param {object} context - Optional safe context object
   */
  assist: async (messages, context = {}) => {
    const res = await axiosInstance.post('/ai/assist', { messages, context });
    return res.data;
  },

  /**
   * Convert text to speech — returns an audio URL (blob URL).
   * @param {string} text
   * @returns {string} Blob URL for the MP3 audio
   */
  textToSpeech: async (text) => {
    const res = await axiosInstance.post('/ai/tts', { text }, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    const blob = new Blob([res.data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  },

  /**
   * Get TTS for a booking summary (auto-generated from booking data).
   * @param {string} bookingId
   * @returns {string} Blob URL for the MP3 audio
   */
  bookingTTS: async (bookingId) => {
    const res = await axiosInstance.post('/ai/tts', { bookingId }, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    const blob = new Blob([res.data], { type: 'audio/mpeg' });
    return URL.createObjectURL(blob);
  },
};
