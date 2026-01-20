import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClientInsuranceEntity } from './ClientInsuranceEntity';

@Entity('insurance_types')
export class InsuranceTypeEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ length: 120 })
    name!: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    description?: string | null;

    @Column({ length: 30, default: 'personal' })
    segment!: string;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    minAmount!: number;

    @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
    maxAmount!: number;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: string;

    @OneToMany(() => ClientInsuranceEntity, (clientInsurance) => clientInsurance.insuranceType)
    clientInsurances!: ClientInsuranceEntity[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
