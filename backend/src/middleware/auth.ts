import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        address: string;
        role: string;
    };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const secret = process.env.JWT_SECRET || 'secret';
        const decoded = jwt.verify(token, secret) as any;
        
        req.user = {
            address: decoded.address,
            role: decoded.role || 'voter'
        };
        
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
    if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
}

