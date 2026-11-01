import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.ts';

export const JWT_SECRET = process.env.JWT_SECRET || 'imovies_ultra_secure_jwt_secret_token_2026';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'No authorization token provided.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found.' });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}

export async function optionalAuthenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        req.userId = user._id.toString();
      }
    }
  } catch {
    // Continue unauthenticated
  }
  next();
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}
