import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string; role?: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
        return res.status(401).json({ message: 'No autorizado.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as { sub: string; role?: string };
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token invalido.' });
    }
}

export function requireRole(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const role = req.user?.role;
        if (!role || !roles.includes(role)) {
            return res.status(403).json({ message: 'No autorizado.' });
        }
        return next();
    };
}
