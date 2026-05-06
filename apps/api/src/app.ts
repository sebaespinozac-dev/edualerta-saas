import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { pingDatabase } from './config/database';
import { requestId } from './middleware/requestId';
import { generalLimiter } from './middleware/rateLimit';
import { audit } from './middleware/audit';
import { errorHandler, notFound } from './middleware/errorHandler';

import authRoutes from './modules/auth/auth.routes';
import establishmentsRoutes from './modules/establishments/establishments.routes';
import studentsRoutes from './modules/students/students.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import alertsRoutes from './modules/alerts/alerts.routes';
import reportsRoutes from './modules/reports/reports.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import usersRoutes from './modules/users/users.routes';
import guardiansRoutes from './modules/guardians/guardians.routes';

export function createApp(): Application {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Core middleware
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req as unknown as { id: string }).id,
      autoLogging: { ignore: (req) => req.url === '/health' },
    }),
  );
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(generalLimiter);
  app.use(audit);

  // Health check
  app.get('/health', async (_req, res) => {
    const db = await pingDatabase();
    const status = db ? 'ok' : 'degraded';
    res.status(db ? 200 : 503).json({
      status,
      service: 'edualerta-api',
      version: '0.1.0',
      checks: { database: db ? 'ok' : 'fail' },
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  const api = express.Router();
  api.use('/auth', authRoutes);
  api.use('/establishments', establishmentsRoutes);
  api.use('/students', studentsRoutes);
  api.use('/attendance', attendanceRoutes);
  api.use('/alerts', alertsRoutes);
  api.use('/reports', reportsRoutes);
  api.use('/notifications', notificationsRoutes);
  api.use('/users', usersRoutes);
  api.use('/guardians', guardiansRoutes);
  app.use('/api/v1', api);

  // Errors
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
