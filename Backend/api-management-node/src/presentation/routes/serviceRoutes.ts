import { Router } from 'express';
import { z } from 'zod';
import { ServiceCatalogService } from '../../application/serviceCatalogService';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const serviceCatalogService = new ServiceCatalogService();

router.use(authMiddleware);

router.get('/', requireRole(['admin']), async (_req, res) => {
    const items = await serviceCatalogService.listServices();
    return res.json(items);
});

router.post('/', requireRole(['admin']), async (req, res) => {
    const schema = z.object({ name: z.string().min(2), description: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await serviceCatalogService.createService(parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.service);
});

router.patch('/:id', requireRole(['admin']), async (req, res) => {
    const schema = z.object({ name: z.string().optional(), description: z.string().optional(), status: z.string().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await serviceCatalogService.updateService(req.params.id, parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result.service);
});

router.delete('/:id', requireRole(['admin']), async (req, res) => {
    await serviceCatalogService.deleteService(req.params.id);
    return res.json({ ok: true });
});

export default router;
