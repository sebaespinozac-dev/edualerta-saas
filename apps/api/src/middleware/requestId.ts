import type { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id');
  req.id = incoming && incoming.length < 100 ? incoming : nanoid(12);
  res.setHeader('x-request-id', req.id);
  next();
}
