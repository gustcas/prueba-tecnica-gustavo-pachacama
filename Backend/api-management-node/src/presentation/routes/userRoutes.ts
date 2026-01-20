import { Router } from 'express';
import { z } from 'zod';
import { UserService } from '../../application/userService';
import { AppDataSource } from '../../infrastructure/db/data-source';
import { LoginAttemptEntity } from '../../infrastructure/db/entities/LoginAttemptEntity';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const userService = new UserService();

router.use(authMiddleware);

router.get('/', requireRole(['admin']), async (_req, res) => {
    const users = await userService.listUsers();
    return res.json(users);
});

router.get('/:id/login-attempts', requireRole(['admin']), async (req, res) => {
    const attemptsRepo = AppDataSource.getRepository(LoginAttemptEntity);
    const attempts = await attemptsRepo.find({ where: { user: { id: req.params.id } }, order: { createdAt: 'DESC' } });
    return res.json(attempts);
});

router.post('/', requireRole(['admin']), async (req, res) => {
    const schema = z.object({
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        identification: z.string().min(5),
        password: z.string().min(8),
        roleId: z.string().uuid()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await userService.createUser(parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.user);
});

router.patch('/:id', requireRole(['admin']), async (req, res) => {
    const schema = z.object({
        status: z.enum(['active', 'blocked', 'inactive']).optional(),
        roleId: z.string().uuid().optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await userService.updateUser(req.params.id, parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result.user);
});

export default router;
