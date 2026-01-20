import { AppDataSource } from '../infrastructure/db/data-source';
import { ServiceEntity } from '../infrastructure/db/entities/ServiceEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';

export class ServiceCatalogService {
    async createService(data: { name: string; description?: string }) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const repo = queryRunner.manager.getRepository(ServiceEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const existing = await repo.findOne({ where: { name: data.name } });
            if (existing) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Servicio duplicado.' };
            }

            const service = repo.create({
                name: data.name,
                description: data.description || null,
                status: 'active'
            });

            await repo.save(service);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'service.created',
                    payload: { serviceId: service.id, name: service.name, timestamp: new Date().toISOString() }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true, service };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al crear servicio.' };
        } finally {
            await queryRunner.release();
        }
    }

    async listServices() {
        const repo = AppDataSource.getRepository(ServiceEntity);
        return repo.find({ order: { name: 'ASC' } });
    }

    async updateService(id: string, data: Partial<ServiceEntity>) {
        const repo = AppDataSource.getRepository(ServiceEntity);
        const outboxRepo = AppDataSource.getRepository(OutboxEventEntity);
        const service = await repo.findOne({ where: { id } });
        if (!service) {
            return { ok: false, message: 'Servicio no encontrado.' };
        }

        Object.assign(service, data);
        await repo.save(service);
        await outboxRepo.save(
            outboxRepo.create({
                type: 'service.updated',
                payload: { serviceId: service.id, timestamp: new Date().toISOString() }
            })
        );
        return { ok: true, service };
    }

    async deleteService(id: string) {
        const repo = AppDataSource.getRepository(ServiceEntity);
        await repo.softDelete({ id });
        return { ok: true };
    }
}
