import { createApp } from './src/app.js';
import { connectDB } from './src/config/db.js';
import { config } from './src/config/env.js';
import { AuthService } from './src/services/auth.service.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Seed default admin account if not existing
  await AuthService.seedAdmin();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(
      `🚀 [Server] Need-to-Solution API running in ${config.nodeEnv} mode on http://localhost:${config.port}`
    );
  });

  // Graceful shutdown handlers
  const handleShutdown = (signal) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
