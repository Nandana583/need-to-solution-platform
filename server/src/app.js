import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import providerRoutes from './routes/provider.routes.js';
import categoryRoutes from './routes/category.routes.js';
import resourceRoutes from './routes/resource.routes.js';
import needRoutes from './routes/need.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import shareRoutes from './routes/share.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reviewRoutes from './routes/review.routes.js';
import messageRoutes from './routes/message.routes.js';
import aiRoutes from './routes/ai.routes.js';
import abuseRoutes from './routes/abuse.routes.js';
import callRoutes from './routes/call.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AppError } from './utils/AppError.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';

export const createApp = () => {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(helmet());

  // 2. CORS with Credentials — supports multiple origins (localhost + production + Vercel previews)
  const allowedOrigins = config.clientUrls;

  // Vercel preview URL pattern — matches all preview deployments for this project
  // e.g. https://client-abc123-nandhana23s-projects.vercel.app
  const VERCEL_PREVIEW_PATTERN = /^https:\/\/client(-[a-z0-9]+)?-(nandhana23s-projects|nandana583)\.vercel\.app$/;

  const isOriginAllowed = (origin) => {
    if (!origin) return true; // Allow non-browser requests (curl, Postman, server-to-server)
    if (allowedOrigins.includes(origin)) return true;
    if (VERCEL_PREVIEW_PATTERN.test(origin)) return true;
    // Always allow localhost in any port for local development
    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
    return false;
  };

  app.use(
    cors({
      origin: (origin, callback) => {
        if (isOriginAllowed(origin)) {
          return callback(null, true);
        }
        return callback(
          new Error(`CORS: Origin "${origin}" is not allowed.`),
          false
        );
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );


  // 3. Body parsers
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // 4. Cookie parser for httpOnly refresh tokens
  app.use(cookieParser());

  // 5. HTTP Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('dev'));
  }

  // 6. Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Need-to-Solution API',
    });
  });

  // 7. Global API rate limiting
  app.use('/api/v1/', apiRateLimiter);

  // 8. Mount API Route modules
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/providers', providerRoutes);
  app.use('/api/v1/categories', categoryRoutes);
  app.use('/api/v1/resources', resourceRoutes);
  app.use('/api/v1/needs', needRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1/shares', shareRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/messages', messageRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/abuse', abuseRoutes);
  app.use('/api/v1/calls', callRoutes);

  // 8. 404 Handler for undefined routes
  app.all('*', (req, res, next) => {
    next(
      new AppError(
        `Cannot find ${req.method} ${req.originalUrl} on this server.`,
        404,
        'NOT_FOUND'
      )
    );
  });

  // 9. Centralized Error Handler
  app.use(errorHandler);

  return app;
};
