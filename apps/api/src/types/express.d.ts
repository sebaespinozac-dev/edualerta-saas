import type { JwtPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      id: string;
      user?: JwtPayload;
    }
  }
}

export {};
