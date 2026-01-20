import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEntity } from './RoleEntity';
import { MenuEntity } from './MenuEntity';

@Entity('role_menus')
export class RoleMenuEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => RoleEntity, (role) => role.roleMenus, { eager: true })
    role!: RoleEntity;

    @ManyToOne(() => MenuEntity, (menu) => menu.roleMenus, { eager: true })
    menu!: MenuEntity;
}
