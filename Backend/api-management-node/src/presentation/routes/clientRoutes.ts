import { Router } from 'express';
import { z } from 'zod';
import { ClientService } from '../../application/clientService';
import { ClientServiceAssignmentService } from '../../application/clientServiceAssignmentService';
import { ClientInsuranceService } from '../../application/clientInsuranceService';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const clientService = new ClientService();
const assignmentService = new ClientServiceAssignmentService();
const clientInsuranceService = new ClientInsuranceService();

router.use(authMiddleware);

router.get('/', requireRole(['admin', 'gestor']), async (_req, res) => {
    const clients = await clientService.listClients();
    return res.json(clients);
});

router.post('/', requireRole(['gestor']), async (req, res) => {
    const schema = z.object({
        type: z.enum(['individual', 'company']),
        identificationType: z.enum(['cedula', 'pasaporte']),
        identification: z.string().min(5),
        email: z.string().email(),
        firstName: z.string().min(2),
        lastName: z.string().min(2),
        companyName: z.string().optional(),
        companySize: z.enum(['pymes', 'large']).optional(),
        phone: z.string().optional(),
        address: z.string().optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await clientService.createClient(parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.status(201).json(result.client);
});

router.get('/:id', requireRole(['admin', 'gestor']), async (req, res) => {
    const client = await clientService.getClient(req.params.id);
    if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado.' });
    }
    return res.json(client);
});

router.patch('/:id', requireRole(['gestor']), async (req, res) => {
    const schema = z.object({
        email: z.string().email().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        companyName: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        status: z.string().optional()
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await clientService.updateClient(req.params.id, parsed.data);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result.client);
});

router.delete('/:id', requireRole(['gestor']), async (req, res) => {
    await clientService.deleteClient(req.params.id);
    return res.json({ ok: true });
});

router.post('/:id/services/assign', requireRole(['gestor']), async (req, res) => {
    const schema = z.object({ serviceId: z.string().uuid() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await assignmentService.assignService(req.params.id, parsed.data.serviceId);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result);
});

router.post('/:id/services/reassign', requireRole(['gestor']), async (req, res) => {
    const schema = z.object({ currentServiceId: z.string().uuid(), newServiceId: z.string().uuid() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await assignmentService.reassignService(req.params.id, parsed.data.currentServiceId, parsed.data.newServiceId);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result);
});

router.post('/:id/services/cancel', requireRole(['gestor']), async (req, res) => {
    const schema = z.object({ serviceId: z.string().uuid() });
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: 'Datos invalidos.' });
    }

    const result = await assignmentService.cancelService(req.params.id, parsed.data.serviceId);
    if (!result.ok) {
        return res.status(400).json({ message: result.message });
    }

    return res.json(result);
});

router.get('/:id/history', requireRole(['admin', 'gestor']), async (req, res) => {
    const insurances = await clientInsuranceService.listClientInsurances();
    const filtered = insurances.filter((item) => item.client.id === req.params.id);
    const services = await assignmentService.listClientServices(req.params.id);
    return res.json({
        insurances: filtered,
        services
    });
});

export default router;
