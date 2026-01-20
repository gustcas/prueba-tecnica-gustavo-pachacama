import bcrypt from 'bcryptjs';
import { AppDataSource } from '../infrastructure/db/data-source';
import { UserEntity, UserStatus } from '../infrastructure/db/entities/UserEntity';
import { RoleEntity } from '../infrastructure/db/entities/RoleEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';
import { buildBaseUsername, ensureSystemUsername, validateSystemUsername } from './usernameUtils';

function isPasswordValid(password: string) {
    const hasUpper = /[A-Z]/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);
    const hasSpace = /\s/.test(password);
    return password.length >= 8 && hasUpper && hasSymbol && !hasSpace;
}

export class UserService {
    async createUser(data: { firstName: string; lastName: string; password: string; roleId: string; identification: string }) {
        if (!isPasswordValid(data.password)) {
            return { ok: false, message: 'Password invalida.' };
        }

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const roleRepo = queryRunner.manager.getRepository(RoleEntity);
            const userRepo = queryRunner.manager.getRepository(UserEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const role = await roleRepo.findOne({ where: { id: data.roleId } });
            if (!role) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Rol no encontrado.' };
            }

            const existingById = await userRepo.findOne({ where: { identification: data.identification } });
            if (existingById) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Identificacion ya registrada.' };
            }

            const base = buildBaseUsername(data.firstName, data.lastName);
            const result = await queryRunner.query('select fn_next_available_username($1) as username', [base]);
            const loginUser = result?.[0]?.username as string;

            const email = `${loginUser}@mail.com`;
            const systemUsername = ensureSystemUsername(loginUser);

            if (!validateSystemUsername(systemUsername)) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'SystemUsername invalido.' };
            }

            const existingBySystem = await userRepo.findOne({ where: { systemUsername } });
            if (existingBySystem) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'SystemUsername duplicado.' };
            }

            const passwordHash = await bcrypt.hash(data.password, 10);
            const user = userRepo.create({
                firstName: data.firstName,
                lastName: data.lastName,
                identification: data.identification,
                loginUser,
                systemUsername,
                email,
                passwordHash,
                status: 'active',
                role
            });

            await userRepo.save(user);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'user.created',
                    payload: {
                        userId: user.id,
                        email: user.email,
                        systemUsername: user.systemUsername,
                        role: role.name,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true, user };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al crear usuario.' };
        } finally {
            await queryRunner.release();
        }
    }

    async listUsers() {
        const repo = AppDataSource.getRepository(UserEntity);
        return repo.find({ order: { createdAt: 'DESC' } });
    }

    async updateUser(id: string, data: { status?: UserStatus; roleId?: string }) {
        const repo = AppDataSource.getRepository(UserEntity);
        const roleRepo = AppDataSource.getRepository(RoleEntity);
        const outboxRepo = AppDataSource.getRepository(OutboxEventEntity);
        const user = await repo.findOne({ where: { id } });
        if (!user) {
            return { ok: false, message: 'Usuario no encontrado.' };
        }

        if (data.status) {
            user.status = data.status;
        }

        if (data.roleId) {
            const role = await roleRepo.findOne({ where: { id: data.roleId } });
            if (!role) {
                return { ok: false, message: 'Rol no encontrado.' };
            }
            user.role = role;
        }

        await repo.save(user);
        await outboxRepo.save(
            outboxRepo.create({
                type: 'user.updated',
                payload: { userId: user.id, status: user.status, roleId: user.role?.id, timestamp: new Date().toISOString() }
            })
        );
        return { ok: true, user };
    }
}
