import { AppDataSource } from '../infrastructure/db/data-source';
import { ClientEntity } from '../infrastructure/db/entities/ClientEntity';
import { ClientServiceEntity } from '../infrastructure/db/entities/ClientServiceEntity';
import { ServiceEntity } from '../infrastructure/db/entities/ServiceEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';
import { NotificationService } from './notificationService';

export class ClientServiceAssignmentService {
    private notifier = new NotificationService();

    async listClientServices(clientId: string) {
        const repo = AppDataSource.getRepository(ClientServiceEntity);
        return repo.find({ where: { client: { id: clientId } }, order: { createdAt: 'DESC' } });
    }

    async assignService(clientId: string, serviceId: string) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const clientRepo = queryRunner.manager.getRepository(ClientEntity);
            const serviceRepo = queryRunner.manager.getRepository(ServiceEntity);
            const repo = queryRunner.manager.getRepository(ClientServiceEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const client = await clientRepo.findOne({ where: { id: clientId } });
            if (!client) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Cliente no encontrado.' };
            }

            const service = await serviceRepo.findOne({ where: { id: serviceId } });
            if (!service) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Servicio no encontrado.' };
            }

            const existingActive = await repo.findOne({ where: { client: { id: client.id }, status: 'active' } });
            if (existingActive) {
                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'client.service.assign.failed',
                        payload: { clientId: client.id, reason: 'service_active', timestamp: new Date().toISOString() }
                    })
                );
                await queryRunner.commitTransaction();
                return { ok: false, message: 'El cliente ya tiene un servicio activo.' };
            }

            const assignment = repo.create({
                client,
                service,
                status: 'active',
                assignedAt: new Date()
            });
            await repo.save(assignment);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'client.service.assigned',
                    payload: { clientId: client.id, serviceId: service.id, timestamp: new Date().toISOString() }
                })
            );

            this.notifier.sendEmail(client.email, 'Servicio asignado', { service: service.name });
            if (client.phone) {
                this.notifier.sendSms(client.phone, `Servicio asignado: ${service.name}`);
            }

            await queryRunner.commitTransaction();
            return { ok: true, assignment };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al asignar servicio.' };
        } finally {
            await queryRunner.release();
        }
    }

    async reassignService(clientId: string, currentServiceId: string, newServiceId: string) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const clientRepo = queryRunner.manager.getRepository(ClientEntity);
            const serviceRepo = queryRunner.manager.getRepository(ServiceEntity);
            const repo = queryRunner.manager.getRepository(ClientServiceEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const client = await clientRepo.findOne({ where: { id: clientId } });
            if (!client) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Cliente no encontrado.' };
            }

            const currentService = await serviceRepo.findOne({ where: { id: currentServiceId } });
            const newService = await serviceRepo.findOne({ where: { id: newServiceId } });
            if (!currentService || !newService) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Servicio no encontrado.' };
            }

            const activeAssignment = await repo.findOne({
                where: { client: { id: client.id }, service: { id: currentService.id }, status: 'active' }
            });

            if (!activeAssignment) {
                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'client.service.reassign.failed',
                        payload: { clientId: client.id, reason: 'no_active_service', timestamp: new Date().toISOString() }
                    })
                );
                await queryRunner.commitTransaction();
                return { ok: false, message: 'No existe servicio activo para reasignar.' };
            }

            activeAssignment.status = 'cancelled';
            activeAssignment.cancelledAt = new Date();
            await repo.save(activeAssignment);

            const newAssignment = repo.create({
                client,
                service: newService,
                status: 'active',
                assignedAt: new Date()
            });
            await repo.save(newAssignment);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'client.service.reassigned',
                    payload: {
                        clientId: client.id,
                        fromServiceId: currentService.id,
                        toServiceId: newService.id,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            this.notifier.sendEmail(client.email, 'Servicio reasignado', { from: currentService.name, to: newService.name });
            if (client.phone) {
                this.notifier.sendSms(client.phone, `Servicio reasignado: ${currentService.name} -> ${newService.name}`);
            }

            await queryRunner.commitTransaction();
            return { ok: true };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al reasignar servicio.' };
        } finally {
            await queryRunner.release();
        }
    }

    async cancelService(clientId: string, serviceId: string) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const clientRepo = queryRunner.manager.getRepository(ClientEntity);
            const serviceRepo = queryRunner.manager.getRepository(ServiceEntity);
            const repo = queryRunner.manager.getRepository(ClientServiceEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const client = await clientRepo.findOne({ where: { id: clientId } });
            const service = await serviceRepo.findOne({ where: { id: serviceId } });
            if (!client || !service) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Cliente o servicio no encontrado.' };
            }

            const activeAssignment = await repo.findOne({
                where: { client: { id: client.id }, service: { id: service.id }, status: 'active' }
            });

            if (!activeAssignment) {
                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'client.service.cancel.failed',
                        payload: { clientId: client.id, reason: 'no_active_service', timestamp: new Date().toISOString() }
                    })
                );
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Servicio no activo.' };
            }

            activeAssignment.status = 'cancelled';
            activeAssignment.cancelledAt = new Date();
            await repo.save(activeAssignment);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'client.service.cancelled',
                    payload: { clientId: client.id, serviceId: service.id, timestamp: new Date().toISOString() }
                })
            );

            this.notifier.sendEmail(client.email, 'Servicio cancelado', { service: service.name });
            if (client.phone) {
                this.notifier.sendSms(client.phone, `Servicio cancelado: ${service.name}`);
            }

            await queryRunner.commitTransaction();
            return { ok: true };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al cancelar servicio.' };
        } finally {
            await queryRunner.release();
        }
    }
}
