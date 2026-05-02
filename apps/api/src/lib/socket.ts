import type { Server as HttpServer } from 'http';
import { Server as IOServer, type Socket } from 'socket.io';
import { env } from '../config/env';
import { verifyAccess } from './jwt';
import { logger } from '../config/logger';

let io: IOServer | null = null;

export function initSocket(server: HttpServer): IOServer {
  io = new IOServer(server, {
    cors: { origin: env.CORS_ORIGIN, credentials: true },
    path: '/socket.io',
  });

  const realtime = io.of('/realtime');

  realtime.use((socket: Socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      (socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') as string | undefined);

    if (!token) return next(new Error('missing token'));
    try {
      const payload = verifyAccess(token);
      (socket.data as { user?: unknown }).user = payload;
      next();
    } catch {
      next(new Error('invalid token'));
    }
  });

  realtime.on('connection', (socket) => {
    const u = (socket.data as { user?: { org?: string; sub?: string } }).user;
    logger.info({ socketId: socket.id, user: u?.sub }, 'socket connected');

    if (u?.org) socket.join(`org:${u.org}`);

    socket.on('subscribe:establishment', (estabId: string) => {
      if (typeof estabId === 'string') socket.join(`estab:${estabId}`);
    });

    socket.on('disconnect', () => logger.debug({ socketId: socket.id }, 'socket disconnected'));
  });

  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('socket.io not initialized');
  return io;
}

export function emitAlert(payload: { establishment_id: string; [k: string]: unknown }) {
  if (!io) return;
  io.of('/realtime').to(`estab:${payload.establishment_id}`).emit('alert', payload);
}
