import { AppDataSource } from '../infrastructure/db/data-source';
import { MenuEntity } from '../infrastructure/db/entities/MenuEntity';
import { RoleEntity } from '../infrastructure/db/entities/RoleEntity';
import { RoleMenuEntity } from '../infrastructure/db/entities/RoleMenuEntity';
import { OutboxEventEntity } from '../infrastructure/db/entities/OutboxEventEntity';

export class MenuService {
    async createMenu(data: { label: string; icon?: string; routerLink?: string; parentId?: string; order?: number }) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const menuRepo = queryRunner.manager.getRepository(MenuEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const menu = menuRepo.create({
                label: data.label,
                icon: data.icon || null,
                routerLink: data.routerLink || null,
                parentId: data.parentId || null,
                order: data.order ?? 0
            });
            await menuRepo.save(menu);

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'menu.created',
                    payload: {
                        menuId: menu.id,
                        label: menu.label,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true, menu };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al crear menu.' };
        } finally {
            await queryRunner.release();
        }
    }

    async listMenus() {
        const repo = AppDataSource.getRepository(MenuEntity);
        return repo.find({ order: { order: 'ASC', label: 'ASC' } });
    }

    async assignMenus(roleId: string, menuIds: string[]) {
        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const roleRepo = queryRunner.manager.getRepository(RoleEntity);
            const roleMenuRepo = queryRunner.manager.getRepository(RoleMenuEntity);
            const outboxRepo = queryRunner.manager.getRepository(OutboxEventEntity);

            const role = await roleRepo.findOne({ where: { id: roleId } });
            if (!role) {
                await queryRunner.commitTransaction();
                return { ok: false, message: 'Rol no encontrado.' };
            }

            await roleMenuRepo.delete({ role: { id: roleId } });

            const roleMenus = menuIds.map((menuId) => roleMenuRepo.create({ role, menu: { id: menuId } as MenuEntity }));
            if (roleMenus.length > 0) {
                await roleMenuRepo.save(roleMenus);
            }

            await outboxRepo.save(
                outboxRepo.create({
                    type: 'role.menus.assigned',
                    payload: {
                        roleId,
                        menuIds,
                        timestamp: new Date().toISOString()
                    }
                })
            );

            await queryRunner.commitTransaction();
            return { ok: true };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { ok: false, message: 'Error al asignar menus.' };
        } finally {
            await queryRunner.release();
        }
    }

    async getMenusByRole(roleId: string) {
        const roleMenuRepo = AppDataSource.getRepository(RoleMenuEntity);
        const items = await roleMenuRepo.find({ where: { role: { id: roleId } } });
        return items.map((item) => item.menu);
    }
}
