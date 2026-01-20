import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClientServiceEntity } from './ClientServiceEntity';

@Entity('services')
export class ServiceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ length: 120 })
    name!: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    description?: string | null;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: string;

    @OneToMany(() => ClientServiceEntity, (clientService) => clientService.service)
    clientServices!: ClientServiceEntity[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
