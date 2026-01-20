import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type OutboxStatus = 'pending' | 'sent' | 'retry';

@Entity('outbox_events')
export class OutboxEventEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ length: 80 })
    type!: string;

    @Column({ type: 'jsonb' })
    payload!: Record<string, unknown>;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: OutboxStatus;

    @Column({ type: 'int', default: 0 })
    tries!: number;

    @Column({ type: 'timestamptz', nullable: true })
    nextRetryAt?: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;
}
