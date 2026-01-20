import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('login_attempts')
export class LoginAttemptEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => UserEntity, { eager: true })
    user!: UserEntity;

    @Column({ type: 'boolean' })
    success!: boolean;

    @Column({ type: 'varchar', length: 60, nullable: true })
    ip?: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;
}
