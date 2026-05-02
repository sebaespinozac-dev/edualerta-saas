import type { Request, Response, NextFunction } from 'express';
import { db } from '../lib/db';
import { logger } from '../config/logger';

const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Logs every state-changing request to audit_logs once the response is sent.
 * Non-blocking — failures are logged but don't impact the request.
 */
export function audit(req: Request, res: Response, next: NextFunction) {
  if (!STATE_CHANGING.has(req.method)) return next();

  res.on('finish', () => {
    // Only audit successful or client-error mutations (skip 5xx noise here)
    if (res.statusCode >= 500) return;

    const userId = req.user?.sub ?? null;
    const action = `${req.method} ${req.baseUrl ?? ''}${req.path}`;
    const resourceType = (req.baseUrl?.split('/').filter(Boolean).pop() ?? 'unknown').slice(0, 80);
    const resourceId = (req.params?.id as string | undefined) ?? null;

    db.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        userId,
        action.slice(0, 80),
        resourceType,
        resourceId,
        req.ip ?? null,
        req.header('user-agent')?.slice(0, 500) ?? null,
        JSON.stringify({ statusCode: res.statusCode, requestId: req.id }),
      ]
    ).catch((err) => logger.warn({ err }, 'audit log insert failed'));
  });

  next();
}
