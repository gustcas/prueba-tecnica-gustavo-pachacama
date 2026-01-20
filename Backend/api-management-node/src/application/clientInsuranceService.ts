import { AppDataSource } from '../infrastructure/db/data-source';
import { ClientEntity } from '../infrastructure/db/entities/ClientEntity';
import { ClientInsuranceEntity } from '../infrastructure/db/entities/ClientInsuranceEntity';
import { InsuranceTypeEntity } from '../infrastructure/db/entities/InsuranceTypeEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';

export class ClientInsuranceService {
    async createClientInsurance(data: { clientId: string; insuranceTypeId: string; amount: number }) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const clientRepo = queryRunner.manager.getRepository(ClientEntity);
            const typeRepo = queryRunner.manager.getRepository(InsuranceTypeEntity);
            const repo = queryRunner.manager.getRepository(ClientInsuranceEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const client = await clientRepo.findOne({ where: { id: data.clientId } });
            if (!client) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Cliente no encontrado.' };
            }

            const insuranceType = await typeRepo.findOne({ where: { id: data.insuranceTypeId } });
            if (!insuranceType) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Tipo de seguro no encontrado.' };
            }

            if (insuranceType.minAmount !== undefined && insuranceType.maxAmount !== undefined) {
                if (data.amount < Number(insuranceType.minAmount) || data.amount > Number(insuranceType.maxAmount)) {
                    await queryRunner.commitTransaction();
                    return { ok: false, message: 'Monto fuera del rango permitido.' };
                }
            }

            if (client.type === 'company') {
                if (!['pymes', 'large'].includes(insuranceType.segment)) {
                    await queryRunner.commitTransaction();
                    return { ok: false, message: 'Tipo de seguro no valido para empresa.' };
                }
                if (client.companySize && insuranceType.segment !== client.companySize) {
                    await queryRunner.commitTransaction();
                    return { ok: false, message: 'Tipo de seguro no corresponde al tamano de la empresa.' };
                }
                const existing = await repo.findOne({
                    where: {
                        client: { id: client.id },
                        insuranceType: { id: insuranceType.id },
                        status: 'active'
                    }
                });
                if (existing) {
                    await queryRunner.commitTransaction();
                    return { ok: false, message: 'Cliente empresa ya tiene este tipo de seguro activo.' };
                }
            } else {
                if (['pymes', 'large'].includes(insuranceType.segment)) {
                    await queryRunner.commitTransaction();
                    return { ok: false, message: 'Tipo de seguro solo disponible para empresas.' };
                }
            }

            const previousCancelled = await repo.findOne({
                where: {
                    client: { id: client.id },
                    insuranceType: { id: insuranceType.id },
                    status: 'cancelled'
                },
                order: { updatedAt: 'DESC' }
            });

            if (previousCancelled) {
                previousCancelled.status = 'active';
                previousCancelled.startDate = new Date();
                previousCancelled.endDate = null;
                previousCancelled.amount = data.amount;
                await repo.save(previousCancelled);

                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'client.insurance.reactivated',
                        payload: {
                            clientId: client.id,
                            insuranceTypeId: insuranceType.id,
                            timestamp: new Date().toISOString()
                        }
                    })
                );

                await queryRunner.commitTransaction();
                return { ok: true, clientInsurance: previousCancelled, reactivated: true };
            }

            const clientInsurance = repo.create({
                client,
                insuranceType,
                status: 'active',
                startDate: new Date(),
                amount: data.amount
            });

            await repo.save(clientInsurance);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'client.insurance.assigned',
                    payload: {
                        clientId: client.id,
                        insuranceTypeId: insuranceType.id,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true, clientInsurance };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al asignar seguro.' };
        } finally {
            await queryRunner.release();
        }
    }

    async listClientInsurances() {
        const repo = AppDataSource.getRepository(ClientInsuranceEntity);
        return repo.find({ order: { createdAt: 'DESC' } });
    }

    async updateClientInsurance(id: string, data: Partial<ClientInsuranceEntity>) {
        const repo = AppDataSource.getRepository(ClientInsuranceEntity);
        const outboxRepo = AppDataSource.getRepository(OutboxEventEntity);
        const item = await repo.findOne({ where: { id } });
        if (!item) {
            return { ok: false, message: 'Seguro no encontrado.' };
        }

        Object.assign(item, data);
        await repo.save(item);
        await outboxRepo.save(
            outboxRepo.create({
                type: 'client.insurance.updated',
                payload: { clientInsuranceId: item.id, status: item.status, timestamp: new Date().toISOString() }
            })
        );
        return { ok: true, clientInsurance: item };
    }

    async deleteClientInsurance(id: string) {
        const repo = AppDataSource.getRepository(ClientInsuranceEntity);
        await repo.softDelete({ id });
        return { ok: true };
    }
}
