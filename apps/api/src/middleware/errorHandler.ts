import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Invalid request payload',
      details: err.flatten(),
      requestId: req.id,
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: err.code ?? 'error',
      message: err.message,
      details: err.details,
      requestId: req.id,
    });
  }
  const e = err as { status?: number; message?: string; code?: string };
  const status = typeof e?.status === 'number' ? e.status : 500;
  if (status >= 500) {
    logger.error({ err, requestId: req.id }, 'unhandled error');
  }
  res.status(status).json({
    error: e?.code ?? (status === 500 ? 'internal_error' : 'error'),
    message: e?.message ?? 'Unexpected error',
    requestId: req.id,
  });
}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'not_found', message: `No route ${req.method} ${req.path}`, requestId: req.id });
}
