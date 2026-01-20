import { AppDataSource } from '../infrastructure/db/data-source';
import { InsuranceTypeEntity } from '../infrastructure/db/entities/InsuranceTypeEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';

export class InsuranceTypeService {
    async createInsuranceType(data: { name: string; description?: string; segment: string; minAmount: number; maxAmount: number }) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const repo = queryRunner.manager.getRepository(InsuranceTypeEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            if (data.minAmount > data.maxAmount) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Rango de montos invalido.' };
            }

            const existing = await repo.findOne({ where: { name: data.name } });
            if (existing) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Tipo de seguro duplicado.' };
            }

            const insuranceType = repo.create({
                name: data.name,
                description: data.description || null,
                segment: data.segment,
                minAmount: data.minAmount,
                maxAmount: data.maxAmount,
                status: 'active'
            });

            await repo.save(insuranceType);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'insurance-type.created',
                    payload: { insuranceTypeId: insuranceType.id, name: insuranceType.name, timestamp: new Date().toISOString() }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true, insuranceType };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al crear tipo de seguro.' };
        } finally {
            await queryRunner.release();
        }
    }

    async listInsuranceTypes() {
        const repo = AppDataSource.getRepository(InsuranceTypeEntity);
        return repo.find({ order: { name: 'ASC' } });
    }

    async updateInsuranceType(id: string, data: Partial<InsuranceTypeEntity>) {
        const repo = AppDataSource.getRepository(InsuranceTypeEntity);
        const outboxRepo = AppDataSource.getRepository(OutboxEventEntity);
        const insuranceType = await repo.findOne({ where: { id } });
        if (!insuranceType) {
            return { ok: false, message: 'Tipo de seguro no encontrado.' };
        }

        if (data.minAmount !== undefined && data.maxAmount !== undefined) {
            if (data.minAmount > data.maxAmount) {
                return { ok: false, message: 'Rango de montos invalido.' };
            }
        }

        Object.assign(insuranceType, data);
        await repo.save(insuranceType);
        await outboxRepo.save(
            outboxRepo.create({
                type: 'insurance-type.updated',
                payload: { insuranceTypeId: insuranceType.id, timestamp: new Date().toISOString() }
            })
        );
        return { ok: true, insuranceType };
    }

    async deleteInsuranceType(id: string) {
        const repo = AppDataSource.getRepository(InsuranceTypeEntity);
        await repo.softDelete({ id });
        return { ok: true };
    }
}
