import { Router } from 'express';
import { z } from 'zod';
import { InsuranceTypeService } from '../../application/insuranceTypeService';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const insuranceTypeService = new InsuranceTypeService();

router.use(authMiddleware);

router.get('/', requireRole(['admin']), async (_req, res) => {
    const items = await insuranceTypeService.listInsuranceTypes();
    return res.json(items);
});

router.post('/', requireRole(['admin']), async (req, res) => {
    const schema = z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        segment: z.string().min(3),
        minAmount: z.number().nonnegative(),
        maxAmount: z.number().positive()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await insuranceTypeService.createInsuranceType(parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.insuranceType);
});

router.patch('/:id', requireRole(['admin']), async (req, res) => {
    const schema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        segment: z.string().optional(),
        minAmount: z.number().nonnegative().optional(),
        maxAmount: z.number().positive().optional()
    });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await insuranceTypeService.updateInsuranceType(req.params.id, parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result.insuranceType);
});

router.delete('/:id', requireRole(['admin']), async (req, res) => {
    await insuranceTypeService.deleteInsuranceType(req.params.id);
    return res.json({ ok: true });
});

export default router;
