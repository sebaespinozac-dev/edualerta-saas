import type { Request, Response, NextFunction } from 'express';
import { verifyAccess, type JwtPayload } from '../lib/jwt';
import { HttpError } from './errorHandler';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing bearer token', 'unauthenticated'));
  }
  try {
    const payload = verifyAccess(header.slice(7).trim()) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token', 'unauthenticated'));
  }
}

export function requireRole(...roles: JwtPayload['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'Authentication required', 'unauthenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, `Role ${req.user.role} not allowed`, 'forbidden'));
    }
    next();
  };
}
