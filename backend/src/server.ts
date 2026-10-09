import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './db';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server running in ${env.NODE_ENV} mode on http://localhost:${env.PORT}`);
});

// Graceful Shutdown Handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Gracefully shutting down HTTP server and Database connection...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database disconnected.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
