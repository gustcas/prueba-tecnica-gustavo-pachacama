import { Column, CreateDateColumn, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ClientInsuranceEntity } from './ClientInsuranceEntity';
import { ClientServiceEntity } from './ClientServiceEntity';

export type ClientType = 'individual' | 'company';
export type IdentificationType = 'cedula' | 'pasaporte';
export type CompanySize = 'pymes' | 'large';

@Entity('clients')
export class ClientEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 20 })
    type!: ClientType;

    @Column({ type: 'varchar', length: 20 })
    identificationType!: IdentificationType;

    @Index({ unique: true })
    @Column({ length: 30 })
    identification!: string;

    @Index({ unique: true })
    @Column({ length: 150 })
    email!: string;

    @Column({ length: 100 })
    firstName!: string;

    @Column({ length: 100 })
    lastName!: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    companyName?: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    companySize?: CompanySize | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone?: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    address?: string | null;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: string;

    @OneToMany(() => ClientInsuranceEntity, (insurance) => insurance.client)
    insurances!: ClientInsuranceEntity[];

    @OneToMany(() => ClientServiceEntity, (service) => service.client)
    services!: ClientServiceEntity[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz' })
    deletedAt!: Date | null;
}
