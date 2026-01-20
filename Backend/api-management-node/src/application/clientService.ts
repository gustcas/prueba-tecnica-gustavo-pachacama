import { AppDataSource } from '../infrastructure/db/data-source';
import { ClientEntity } from '../infrastructure/db/entities/ClientEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';
import { isValidEcuadorianId } from './ecuadorIdValidator';
import { NotificationService } from './notificationService';

export class ClientService {
    private notifier = new NotificationService();

    async createClient(data: {
        type: 'individual' | 'company';
        identificationType: 'cedula' | 'pasaporte';
        identification: string;
        email: string;
        firstName: string;
        lastName: string;
        companyName?: string;
        companySize?: 'pymes' | 'large';
        phone?: string;
        address?: string;
    }) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const repo = queryRunner.manager.getRepository(ClientEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            if (data.identificationType === 'cedula' && !isValidEcuadorianId(data.identification)) {
                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'client.create.failed',
                        payload: { reason: 'cedula_invalida', identification: data.identification, timestamp: new Date().toISOString() }
                    })
                );
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Cedula invalida.' };
            }

            const existingId = await repo.findOne({ where: { identification: data.identification } });
            if (existingId) {
                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'client.create.failed',
                        payload: { reason: 'identification_duplicated', identification: data.identification, timestamp: new Date().toISOString() }
                    })
                );
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Identificacion duplicada.' };
            }

            const existingEmail = await repo.findOne({ where: { email: data.email } });
            if (existingEmail) {
                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'client.create.failed',
                        payload: { reason: 'email_duplicated', email: data.email, timestamp: new Date().toISOString() }
                    })
                );
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Email duplicado.' };
            }

            const client = repo.create({
                type: data.type,
                identificationType: data.identificationType,
                identification: data.identification,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                companyName: data.companyName || null,
                companySize: data.companySize || null,
                phone: data.phone || null,
                address: data.address || null,
                status: 'active'
            });

            await repo.save(client);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'client.created',
                    payload: {
                        clientId: client.id,
                        email: client.email,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            this.notifier.sendEmail(client.email, 'Registro de cliente', { clientId: client.id, name: `${client.firstName} ${client.lastName}` });
            if (client.phone) {
                this.notifier.sendSms(client.phone, 'Su registro fue exitoso.');
            }

            await queryRunner.commitTransaction();
            return { ok: true, client };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al crear cliente.' };
        } finally {
            await queryRunner.release();
        }
    }

    async listClients() {
        const repo = AppDataSource.getRepository(ClientEntity);
        return repo.find({ order: { createdAt: 'DESC' } });
    }

    async getClient(id: string) {
        const repo = AppDataSource.getRepository(ClientEntity);
        return repo.findOne({ where: { id } });
    }

    async updateClient(id: string, data: Partial<ClientEntity>) {
        const repo = AppDataSource.getRepository(ClientEntity);
        const outboxRepo = AppDataSource.getRepository(OutboxEventEntity);
        const client = await repo.findOne({ where: { id } });
        if (!client) {
            return { ok: false, message: 'Cliente no encontrado.' };
        }

        Object.assign(client, data);
        await repo.save(client);
        await outboxRepo.save(
            outboxRepo.create({
                type: 'client.updated',
                payload: { clientId: client.id, timestamp: new Date().toISOString() }
            })
        );
        return { ok: true, client };
    }

    async deleteClient(id: string) {
        const repo = AppDataSource.getRepository(ClientEntity);
        await repo.softDelete({ id });
        return { ok: true };
    }
}
