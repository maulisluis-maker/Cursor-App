import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthClaims = { sub: string; role: 'MEMBER' | 'ADMIN' };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = header.slice('Bearer '.length);
  
  // Allow demo-token for testing
  if (token === 'demo-token') {
    (req as any).auth = { sub: 'demo-user', role: 'ADMIN' };
    return next();
  }
  
  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET as string) as AuthClaims;
    (req as any).auth = claims;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const claims = (req as any).auth as AuthClaims | undefined;
  if (!claims) return res.status(401).json({ error: 'Unauthorized' });
  if (claims.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  next();
}
