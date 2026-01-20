import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './infrastructure/db/data-source';
import authRoutes from './presentation/routes/authRoutes';
import userRoutes from './presentation/routes/userRoutes';
import roleRoutes from './presentation/routes/roleRoutes';
import menuRoutes from './presentation/routes/menuRoutes';
import clientRoutes from './presentation/routes/clientRoutes';
import insuranceTypeRoutes from './presentation/routes/insuranceTypeRoutes';
import clientInsuranceRoutes from './presentation/routes/clientInsuranceRoutes';
import serviceRoutes from './presentation/routes/serviceRoutes';
import dashboardRoutes from './presentation/routes/dashboardRoutes';
import { swaggerSpec } from './presentation/swagger';
import { startOutboxWorker } from './workers/outboxWorker';
import { OutboxEventEntity } from './infrastructure/db/entities/OutboxEventEntity';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/insurance-types', insuranceTypeRoutes);
app.use('/api/client-insurances', clientInsuranceRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error', err);
    if (AppDataSource.isInitialized) {
        const repo = AppDataSource.getRepository(OutboxEventEntity);
        repo.save({
            type: 'system.error',
            payload: { message: err.message, timestamp: new Date().toISOString() },
            status: 'pending',
            tries: 0
        }).catch(() => {});
    }
    return res.status(500).json({ message: 'Error interno.' });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3001;

AppDataSource.initialize()
    .then(() => {
        app.listen(port, () => {
            console.log(`API running on ${port}`);
        });
        startOutboxWorker();
    })
    .catch((error) => {
        console.error('DataSource init error', error);
    });
