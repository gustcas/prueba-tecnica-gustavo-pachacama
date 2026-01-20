import { Router } from 'express';
import { z } from 'zod';
import { RoleService } from '../../application/roleService';
import { MenuService } from '../../application/menuService';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const roleService = new RoleService();
const menuService = new MenuService();

router.use(authMiddleware);

router.get('/', requireRole(['admin']), async (_req, res) => {
    const roles = await roleService.listRoles();
    return res.json(roles);
});

router.post('/', requireRole(['admin']), async (req, res) => {
    const schema = z.object({
        name: z.string().min(3),
        description: z.string().max(200).optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await roleService.createRole(parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.role);
});

router.get('/:id/menus', requireRole(['admin', 'gestor']), async (req, res) => {
    const menus = await menuService.getMenusByRole(req.params.id);
    return res.json(menus);
});

router.put('/:id/menus', requireRole(['admin']), async (req, res) => {
    const schema = z.object({ menuIds: z.array(z.string().uuid()) });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await menuService.assignMenus(req.params.id, parsed.data.menuIds);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json({ ok: true });
});

export default router;
