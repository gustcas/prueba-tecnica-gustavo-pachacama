import { AppDataSource } from '../infrastructure/db/data-source';
import { ClientEntity } from '../infrastructure/db/entities/ClientEntity';
import { ClientInsuranceEntity } from '../infrastructure/db/entities/ClientInsuranceEntity';
import { InsuranceTypeEntity } from '../infrastructure/db/entities/InsuranceTypeEntity';
import { LoginAttemptEntity } from '../infrastructure/db/entities/LoginAttemptEntity';
import { ServiceEntity } from '../infrastructure/db/entities/ServiceEntity';
import { UserEntity } from '../infrastructure/db/entities/UserEntity';

export class DashboardService {
    async getMetrics() {
        const clientRepo = AppDataSource.getRepository(ClientEntity);
        const insuranceTypeRepo = AppDataSource.getRepository(InsuranceTypeEntity);
        const clientInsuranceRepo = AppDataSource.getRepository(ClientInsuranceEntity);
        const loginAttemptRepo = AppDataSource.getRepository(LoginAttemptEntity);
        const serviceRepo = AppDataSource.getRepository(ServiceEntity);
        const userRepo = AppDataSource.getRepository(UserEntity);

        const [
            totalClients,
            totalInsuranceTypes,
            totalClientInsurances,
            failedLogins,
            totalServices,
            totalUsers
        ] = await Promise.all([
            clientRepo.count(),
            insuranceTypeRepo.count(),
            clientInsuranceRepo.count({ where: { status: 'active' } }),
            loginAttemptRepo.count({ where: { success: false } }),
            serviceRepo.count(),
            userRepo.count()
        ]);

        return {
            totalClients,
            totalInsuranceTypes,
            totalClientInsurances,
            failedLogins,
            totalServices,
            totalUsers
        };
    }
}
