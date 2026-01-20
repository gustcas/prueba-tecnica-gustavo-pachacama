import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/UserEntity';
import { RoleEntity } from './entities/RoleEntity';
import { MenuEntity } from './entities/MenuEntity';
import { RoleMenuEntity } from './entities/RoleMenuEntity';
import { SessionEntity } from './entities/SessionEntity';
import { LoginAttemptEntity } from './entities/LoginAttemptEntity';
import { OutboxEventEntity } from './entities/OutboxEventEntity';
import { ClientEntity } from './entities/ClientEntity';
import { InsuranceTypeEntity } from './entities/InsuranceTypeEntity';
import { ClientInsuranceEntity } from './entities/ClientInsuranceEntity';
import { ServiceEntity } from './entities/ServiceEntity';
import { ClientServiceEntity } from './entities/ClientServiceEntity';

const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [
        UserEntity,
        RoleEntity,
        MenuEntity,
        RoleMenuEntity,
        SessionEntity,
        LoginAttemptEntity,
        OutboxEventEntity,
        ClientEntity,
        InsuranceTypeEntity,
        ClientInsuranceEntity,
        ServiceEntity,
        ClientServiceEntity
    ]
});
