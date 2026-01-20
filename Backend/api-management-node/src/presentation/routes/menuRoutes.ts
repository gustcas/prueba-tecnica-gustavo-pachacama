import { Router } from 'express';
import { z } from 'zod';
import { MenuService } from '../../application/menuService';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const menuService = new MenuService();

router.use(authMiddleware);

router.get('/', requireRole(['admin']), async (_req, res) => {
    const menus = await menuService.listMenus();
    return res.json(menus);
});

router.post('/', requireRole(['admin']), async (req, res) => {
    const schema = z.object({
        label: z.string().min(2),
        icon: z.string().optional(),
        routerLink: z.string().optional(),
        parentId: z.string().uuid().optional(),
        order: z.number().int().optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await menuService.createMenu(parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.menu);
});

export default router;
