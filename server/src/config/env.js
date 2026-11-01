import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/need-to-solution',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_key_need_to_solution_2026_jwt_token',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_need_to_solution_2026_refresh_token',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  // Supports comma-separated list: "http://localhost:5173,https://client-nu-gilt.vercel.app"
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  adminSeed: {
    email: process.env.ADMIN_EMAIL || 'admin@needtosolution.com',
    password: process.env.ADMIN_PASSWORD || 'AdminPassword@123',
  },
  // AI configuration — all features degrade gracefully when key is absent
  ai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    enabled: (process.env.AI_FEATURES_ENABLED || 'true').toLowerCase() !== 'false',
    modelChat: process.env.AI_MODEL_CHAT || 'gpt-4o',
    modelStt: process.env.AI_MODEL_STT || 'whisper-1',
    modelTts: process.env.AI_MODEL_TTS || 'tts-1',
    ttsVoice: process.env.AI_TTS_VOICE || 'alloy',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024', 10),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '30000', 10),
  },
};

