import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { apiRateLimiter } from './middlewares/rateLimit.middleware';

export const createApp = (): Application => {
  const app: Application = express();

  // Security & HTTP Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
    app.use('/api', apiRateLimiter);
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'StoreRatings Platform API',
      timestamp: new Date().toISOString(),
    });
  });

  // Mount API Routes
  app.use('/api', routes);

  // Global Error Handler Middleware
  app.use(errorHandler);

  return app;
};
