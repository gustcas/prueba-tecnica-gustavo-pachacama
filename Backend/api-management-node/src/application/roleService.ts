import { AppDataSource } from '../infrastructure/db/data-source';
import { RoleEntity } from '../infrastructure/db/entities/RoleEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';

export class RoleService {
    async createRole(data: { name: string; description?: string }) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const roleRepo = queryRunner.manager.getRepository(RoleEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const existing = await roleRepo.findOne({ where: { name: data.name } });
            if (existing) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Rol duplicado.' };
            }

            const role = roleRepo.create({ name: data.name, description: data.description || null });
            await roleRepo.save(role);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'role.created',
                    payload: {
                        roleId: role.id,
                        name: role.name,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true, role };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al crear rol.' };
        } finally {
            await queryRunner.release();
        }
    }

    async listRoles() {
        const repo = AppDataSource.getRepository(RoleEntity);
        return repo.find({ order: { name: 'ASC' } });
    }
}
