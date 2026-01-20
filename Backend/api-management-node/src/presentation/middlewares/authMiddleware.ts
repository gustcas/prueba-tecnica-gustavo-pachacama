import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string; role?: string };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';

    if (!token) {
        console.warn(`[auth] 401 token ausente ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ message: 'No autorizado: token requerido.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as { sub: string; role?: string };
        req.user = { id: payload.sub, role: payload.role };
        return next();
    } catch (error) {
        console.warn(`[auth] 401 token invalido ${req.method} ${req.originalUrl}`);
        return res.status(401).json({ message: 'No autorizado: token invalido.' });
    }
}

export function requireRole(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        const role = (req.user?.role || '').toLowerCase();
        const allowed = roles.map((item) => item.toLowerCase());
        if (!role || !allowed.includes(role)) {
            console.warn(`[auth] 403 rol insuficiente role=${req.user?.role || 'none'} path=${req.originalUrl}`);
            return res.status(403).json({ message: 'No autorizado: rol insuficiente.' });
        }
        return next();
    };
}
