import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClientEntity } from './ClientEntity';
import { ServiceEntity } from './ServiceEntity';

@Entity('client_services')
export class ClientServiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => ClientEntity, (client) => client.services, { eager: true })
    client!: ClientEntity;

    @ManyToOne(() => ServiceEntity, (service) => service.clientServices, { eager: true })
    service!: ServiceEntity;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: string;

    @Column({ type: 'timestamptz' })
    assignedAt!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    cancelledAt?: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
