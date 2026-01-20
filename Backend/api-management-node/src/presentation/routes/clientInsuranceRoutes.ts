import { Router } from 'express';
import { z } from 'zod';
import { ClientInsuranceService } from '../../application/clientInsuranceService';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const clientInsuranceService = new ClientInsuranceService();

router.use(authMiddleware);

router.get('/', requireRole(['admin', 'gestor']), async (_req, res) => {
    const items = await clientInsuranceService.listClientInsurances();
    return res.json(items);
});

router.post('/', requireRole(['gestor']), async (req, res) => {
    const schema = z.object({ clientId: z.string().uuid(), insuranceTypeId: z.string().uuid(), amount: z.number().positive() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await clientInsuranceService.createClientInsurance(parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.clientInsurance);
});

router.patch('/:id', requireRole(['gestor']), async (req, res) => {
    const schema = z.object({ status: z.string().optional(), endDate: z.string().datetime().optional() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const updatePayload: any = { ...parsed.data };
    if (parsed.data.endDate) {
        updatePayload.endDate = new Date(parsed.data.endDate);
    }

    const result = await clientInsuranceService.updateClientInsurance(req.params.id, updatePayload);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result.clientInsurance);
});

router.delete('/:id', requireRole(['gestor']), async (req, res) => {
    await clientInsuranceService.deleteClientInsurance(req.params.id);
    return res.json({ ok: true });
});

export default router;
