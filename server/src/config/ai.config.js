import OpenAI from 'openai';

// Centralized AI configuration — all model identifiers, timeouts, and feature flags live here.
const apiKey = process.env.OPENAI_API_KEY || '';
const featuresEnabled = (process.env.AI_FEATURES_ENABLED || 'true').toLowerCase() !== 'false';

let openaiClient = null;
if (apiKey && featuresEnabled) {
  try {
    openaiClient = new OpenAI({ apiKey });
  } catch (err) {
    console.warn('[AI Config] Failed to initialize OpenAI client:', err.message);
  }
}

export const aiConfig = {
  enabled: Boolean(openaiClient),
  models: {
    chat: process.env.AI_MODEL_CHAT || 'gpt-4o',
    stt: process.env.AI_MODEL_STT || 'whisper-1',
    tts: process.env.AI_MODEL_TTS || 'tts-1',
  },
  ttsVoice: process.env.AI_TTS_VOICE || 'alloy',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024', 10),
  timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000', 10),
  maxAudioSizeBytes: 25 * 1024 * 1024,
  supportedLanguages: ['Telugu', 'Telugu-English (code-switching)', 'English', 'Hindi', 'Tamil'],
  languageNote: 'Voice input works best in Chrome or Edge. Telugu and Telugu-English code-switching are supported via Whisper.',
  client: openaiClient,
};

if (!aiConfig.enabled) {
  console.log('[AI Config] AI features disabled. Set OPENAI_API_KEY and AI_FEATURES_ENABLED=true to enable.');
} else {
  console.log(`[AI Config] Enabled — Chat: ${aiConfig.models.chat} | STT: ${aiConfig.models.stt} | TTS: ${aiConfig.models.tts}`);
}
