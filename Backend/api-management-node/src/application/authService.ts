import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../infrastructure/db/data-source';
import { UserEntity } from '../infrastructure/db/entities/UserEntity';
import { SessionEntity } from '../infrastructure/db/entities/SessionEntity';
import { LoginAttemptEntity } from '../infrastructure/db/entities/LoginAttemptEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';

export class AuthService {
    async login(identifier: string, password: string, ip?: string | null) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const userRepo = queryRunner.manager.getRepository(UserEntity);
            const sessionRepo = queryRunner.manager.getRepository(SessionEntity);
            const attemptsRepo = queryRunner.manager.getRepository(LoginAttemptEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const user = await userRepo.findOne({
                where: [{ email: identifier }, { systemUsername: identifier }]
            });

            if (!user) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Credenciales invalidas.' };
            }

            if (user.status === 'blocked') {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Usuario bloqueado por intentos fallidos.' };
            }

            const activeSession = await sessionRepo.findOne({ where: { user: { id: user.id }, isActive: true } });
            if (activeSession) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Ya existe una sesion activa para este usuario.' };
            }

            const passwordOk = await bcrypt.compare(password, user.passwordHash);
            const attempt = attemptsRepo.create({ user, success: passwordOk, ip: ip || null });
            await attemptsRepo.save(attempt);

            if (!passwordOk) {
                user.failedLoginAttempts += 1;
                if (user.failedLoginAttempts >= 3) {
                    user.status = 'blocked';
                }
                await userRepo.save(user);
                await outboxRepo.save(
                    outboxRepo.create({
                        type: 'user.login.failed',
                        payload: {
                            userId: user.id,
                            email: user.email,
                            systemUsername: user.systemUsername,
                            failedCount: user.failedLoginAttempts,
                            blocked: user.status === 'blocked',
                            timestamp: new Date().toISOString()
                        }
                    })
                );
                await queryRunner.commitTransaction();
                return { ok: false, message: user.status === 'blocked' ? 'Usuario bloqueado por 3 intentos fallidos.' : 'Credenciales invalidas.' };
            }

            user.failedLoginAttempts = 0;
            await userRepo.save(user);

            const session = sessionRepo.create({
                user,
                startedAt: new Date(),
                isActive: true
            });
            await sessionRepo.save(session);

            const token = jwt.sign(
                {
                    sub: user.id,
                    role: user.role?.name
                },
                process.env.JWT_SECRET || 'dev_secret',
                { expiresIn: '8h' }
            );

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'user.login',
                    payload: {
                        userId: user.id,
                        email: user.email,
                        systemUsername: user.systemUsername,
                        sessionId: session.id,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            await queryRunner.commitTransaction();

            return {
                ok: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    systemUsername: user.systemUsername,
                    role: user.role?.name,
                    roleId: user.role?.id
                },
                sessionId: session.id
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al iniciar sesion.' };
        } finally {
            await queryRunner.release();
        }
    }

    async logout(userId: string, sessionId: string) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const sessionRepo = queryRunner.manager.getRepository(SessionEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const session = await sessionRepo.findOne({ where: { id: sessionId, user: { id: userId }, isActive: true } });
            if (!session) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Sesion no encontrada.' };
            }

            session.isActive = false;
            session.endedAt = new Date();
            await sessionRepo.save(session);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'user.logout',
                    payload: {
                        userId,
                        sessionId,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al cerrar sesion.' };
        } finally {
            await queryRunner.release();
        }
    }

    async getSessionSummary(userId: string) {
        const sessionRepo = AppDataSource.getRepository(SessionEntity);
        const attemptsRepo = AppDataSource.getRepository(LoginAttemptEntity);

        const lastSession = await sessionRepo.findOne({
            where: { user: { id: userId } },
            order: { startedAt: 'DESC' }
        });

        const failedAttempts = await attemptsRepo.count({
            where: { user: { id: userId }, success: false }
        });

        const lastFailedAttempt = await attemptsRepo.findOne({
            where: { user: { id: userId }, success: false },
            order: { createdAt: 'DESC' }
        });

        return {
            lastSession: lastSession
                ? {
                      startedAt: lastSession.startedAt,
                      endedAt: lastSession.endedAt,
                      isActive: lastSession.isActive
                  }
                : null,
            failedAttempts,
            lastFailedAt: lastFailedAttempt?.createdAt || null
        };
    }
}
