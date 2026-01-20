import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RoleMenuEntity } from './RoleMenuEntity';

@Entity('menus')
export class MenuEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 100 })
    label!: string;

    @Column({ type: 'varchar', length: 80, nullable: true })
    icon?: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
    routerLink?: string | null;

    @Column({ type: 'uuid', nullable: true })
    parentId?: string | null;

    @Column({ type: 'int', default: 0 })
    order!: number;

    @OneToMany(() => RoleMenuEntity, (roleMenu) => roleMenu.menu)
    roleMenus!: RoleMenuEntity[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
