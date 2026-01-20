import { Router } from 'express';
import { DashboardService } from '../../application/dashboardService';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware';

const router = Router();
const dashboardService = new DashboardService();

router.use(authMiddleware);

router.get('/metrics', requireRole(['admin']), async (_req, res) => {
    const metrics = await dashboardService.getMetrics();
    return res.json(metrics);
});

export default router;
