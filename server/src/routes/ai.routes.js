import express from 'express';
import multer from 'multer';
import {
  getAIStatus,
  extractNeed,
  transcribeAudio,
  assist,
  textToSpeech,
} from '../controllers/ai.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { apiRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

// Multer: store audio in memory (buffer). Max 25 MB to match Whisper limit.
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'audio/webm', 'audio/wav', 'audio/ogg', 'audio/mp4',
      'audio/mpeg', 'audio/mp3', 'audio/flac',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`), false);
    }
  },
});

// Public status endpoint (no auth required)
router.get('/status', getAIStatus);

// All other AI routes require authentication
router.use(authMiddleware);
router.use(apiRateLimiter);

router.post('/extract', extractNeed);
router.post('/transcribe', audioUpload.single('audio'), transcribeAudio);
router.post('/assist', assist);
router.post('/tts', textToSpeech);

export default router;
