import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../../application/authService';
import { authMiddleware, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();
const authService = new AuthService();

router.post('/login', async (req, res) => {
    const schema = z.object({
        identifier: z.string().min(1),
        password: z.string().min(1)
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await authService.login(parsed.data.identifier, parsed.data.password, req.ip);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result);
});

router.post('/logout', authMiddleware, async (req: AuthRequest, res) => {
    const schema = z.object({ sessionId: z.string().uuid() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success || !req.user) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await authService.logout(req.user.id, parsed.data.sessionId);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json({ ok: true });
});

router.get('/me/summary', authMiddleware, async (req: AuthRequest, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'No autorizado.' });
    }
    const summary = await authService.getSessionSummary(req.user.id);
    return res.json(summary);
});

router.post('/forgot-password', async (_req, res) => {
    return res.json({ ok: true, message: 'Email enviado (mock).' });
});

export default router;
