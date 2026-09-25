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
import { errorHandler } from './middleware/error.middleware.js';
import { AppError } from './utils/AppError.js';

export const createApp = () => {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(helmet());

  // 2. CORS with Credentials — supports multiple origins (localhost + production)
  const allowedOrigins = config.clientUrls;
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
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

  // 7. Mount API Route modules
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
