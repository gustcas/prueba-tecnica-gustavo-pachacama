import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserEntity } from './UserEntity';
import { RoleMenuEntity } from './RoleMenuEntity';

@Entity('roles')
export class RoleEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 80, unique: true })
    name!: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    description?: string | null;

    @OneToMany(() => UserEntity, (user) => user.role)
    users!: UserEntity[];

    @OneToMany(() => RoleMenuEntity, (roleMenu) => roleMenu.role)
    roleMenus!: RoleMenuEntity[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
