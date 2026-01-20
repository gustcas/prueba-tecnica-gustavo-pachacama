import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClientEntity } from './ClientEntity';
import { InsuranceTypeEntity } from './InsuranceTypeEntity';

@Entity('client_insurances')
export class ClientInsuranceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => ClientEntity, (client) => client.insurances, { eager: true })
    client!: ClientEntity;

    @ManyToOne(() => InsuranceTypeEntity, (type) => type.clientInsurances, { eager: true })
    insuranceType!: InsuranceTypeEntity;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    amount!: number;

    @Column({ type: 'timestamptz', nullable: true })
    startDate?: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    endDate?: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
