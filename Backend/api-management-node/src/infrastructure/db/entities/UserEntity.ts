import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RoleEntity } from './RoleEntity';

export type UserStatus = 'active' | 'blocked' | 'inactive';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 100 })
    firstName!: string;

    @Column({ length: 100 })
    lastName!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 20, nullable: true })
    identification?: string | null;

    @Column({ length: 50, unique: true })
    loginUser!: string;

    @Column({ length: 50, unique: true })
    systemUsername!: string;

    @Column({ length: 150, unique: true })
    email!: string;

    @Column({ length: 255 })
    passwordHash!: string;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: UserStatus;

    @Column({ type: 'int', default: 0 })
    failedLoginAttempts!: number;

    @ManyToOne(() => RoleEntity, (role) => role.users, { eager: true })
    role!: RoleEntity;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
