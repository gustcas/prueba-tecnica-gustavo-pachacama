import 'dotenv/config';
import { AppDataSource } from './infrastructure/db/data-source';
import { RoleEntity } from './infrastructure/db/entities/RoleEntity';
import { MenuEntity } from './infrastructure/db/entities/MenuEntity';
import { RoleMenuEntity } from './infrastructure/db/entities/RoleMenuEntity';
import { InsuranceTypeEntity } from './infrastructure/db/entities/InsuranceTypeEntity';
import { UserEntity } from './infrastructure/db/entities/UserEntity';
import { ServiceEntity } from './infrastructure/db/entities/ServiceEntity';
import { ClientEntity } from './infrastructure/db/entities/ClientEntity';
import { ClientInsuranceEntity } from './infrastructure/db/entities/ClientInsuranceEntity';
import { ClientServiceEntity } from './infrastructure/db/entities/ClientServiceEntity';
import bcrypt from 'bcryptjs';

async function seed() {
    await AppDataSource.initialize();

    const roleRepo = AppDataSource.getRepository(RoleEntity);
    const menuRepo = AppDataSource.getRepository(MenuEntity);
    const roleMenuRepo = AppDataSource.getRepository(RoleMenuEntity);
    const insuranceRepo = AppDataSource.getRepository(InsuranceTypeEntity);
    const userRepo = AppDataSource.getRepository(UserEntity);
    const serviceRepo = AppDataSource.getRepository(ServiceEntity);
    const clientRepo = AppDataSource.getRepository(ClientEntity);
    const clientInsuranceRepo = AppDataSource.getRepository(ClientInsuranceEntity);
    const clientServiceRepo = AppDataSource.getRepository(ClientServiceEntity);

    const obsoleteWelcome = await menuRepo.findOne({ where: [{ routerLink: '/welcome' }, { label: 'Welcome' }] });
    if (obsoleteWelcome) {
        await roleMenuRepo.createQueryBuilder().delete().where('menuId = :menuId', { menuId: obsoleteWelcome.id }).execute();
        await menuRepo.delete({ id: obsoleteWelcome.id });
    }

    let adminRole = await roleRepo.findOne({ where: { name: 'admin' } });
    if (!adminRole) {
        adminRole = await roleRepo.save(roleRepo.create({ name: 'admin', description: 'Administrador' }));
    }

    let gestorRole = await roleRepo.findOne({ where: { name: 'gestor' } });
    if (!gestorRole) {
        gestorRole = await roleRepo.save(roleRepo.create({ name: 'gestor', description: 'Gestor' }));
    }

    const ensureMenu = async (label: string, routerLink?: string, icon?: string, parentId?: string | null, order = 0) => {
        let menu = await menuRepo.findOne({ where: { label, parentId: parentId || null } });
        if (!menu) {
            menu = await menuRepo.save(
                menuRepo.create({ label, routerLink: routerLink || null, icon: icon || null, parentId: parentId || null, order })
            );
        }
        return menu;
    };

    const general = await ensureMenu('General', undefined, 'pi pi-fw pi-home', null, 0);
    const admin = await ensureMenu('Administracion', undefined, 'pi pi-fw pi-cog', null, 1);
    const gestor = await ensureMenu('Gestion', undefined, 'pi pi-fw pi-briefcase', null, 2);

    const dashboard = await ensureMenu('Dashboard', '/dashboard', 'pi pi-fw pi-chart-bar', general.id, 0);

    const users = await ensureMenu('Usuarios', '/admin/users', 'pi pi-fw pi-users', admin.id, 0);
    const roles = await ensureMenu('Roles', '/admin/roles', 'pi pi-fw pi-shield', admin.id, 1);
    const menus = await ensureMenu('Menus', '/admin/menus', 'pi pi-fw pi-list', admin.id, 2);
    const insuranceTypes = await ensureMenu('Tipos de seguro', '/admin/insurance-types', 'pi pi-fw pi-book', admin.id, 3);
    const services = await ensureMenu('Servicios', '/admin/services', 'pi pi-fw pi-briefcase', admin.id, 4);

    const clients = await ensureMenu('Clientes', '/clients', 'pi pi-fw pi-id-card', gestor.id, 0);
    const clientInsurances = await ensureMenu('Polizas', '/client-insurances', 'pi pi-fw pi-file', gestor.id, 1);
    const clientServices = await ensureMenu('Servicios cliente', '/client-services', 'pi pi-fw pi-wrench', gestor.id, 2);

    const adminMenus = [general, admin, dashboard, users, roles, menus, insuranceTypes, services, gestor, clients, clientInsurances, clientServices];
    const gestorMenus = [general, dashboard, gestor, clients, clientInsurances, clientServices];

    await roleMenuRepo.delete({ role: { id: adminRole.id } });
    await roleMenuRepo.delete({ role: { id: gestorRole.id } });

    await roleMenuRepo.save(adminMenus.map((menu) => roleMenuRepo.create({ role: adminRole!, menu })));
    await roleMenuRepo.save(gestorMenus.map((menu) => roleMenuRepo.create({ role: gestorRole!, menu })));

    const ensureInsurance = async (name: string, segment: string, minAmount: number, maxAmount: number, description?: string) => {
        let item = await insuranceRepo.findOne({ where: { name } });
        if (!item) {
            item = await insuranceRepo.save(
                insuranceRepo.create({ name, segment, minAmount, maxAmount, description: description || null, status: 'active' })
            );
        }
        return item;
    };

    await ensureInsurance('Seguro PYMES', 'pymes', 700, 10000, 'Empresas PYMEs');
    await ensureInsurance('Seguro Grandes Empresas', 'large', 5000, 6000000, 'Grandes empresas');
    await ensureInsurance('Seguro Personal', 'personal', 100, 100000, 'Personas');
    await ensureInsurance('Seguro Auto', 'auto', 200, 200000, 'Personas');
    await ensureInsurance('Seguro Medico Familiar', 'medico_familiar', 200, 150000, 'Personas');
    await ensureInsurance('Seguro Dental', 'dental', 100, 50000, 'Personas');
    await ensureInsurance('Poliza', 'poliza', 100, 300000, 'Personas');

    const ensureService = async (name: string, description?: string) => {
        let item = await serviceRepo.findOne({ where: { name } });
        if (!item) {
            item = await serviceRepo.save(serviceRepo.create({ name, description: description || null, status: 'active' }));
        }
        return item;
    };

    const asistenciaVial = await ensureService('Asistencia vial', 'Servicio de asistencia vehicular');
    const asistenciaHogar = await ensureService('Asistencia hogar', 'Servicio de asistencia en el hogar');

    const passwordHash = await bcrypt.hash('Password@1', 10);

    const ensureUser = async (payload: Partial<UserEntity>) => {
        if (!payload.identification) {
            return null;
        }
        let user = await userRepo.findOne({ where: { identification: payload.identification } });
        if (!user) {
            user = await userRepo.save(userRepo.create(payload));
        }
        return user;
    };

    const adminUser = await ensureUser({
        firstName: 'Juan',
        lastName: 'Piguave',
        identification: '1203574901',
        loginUser: 'jpiguave',
        systemUsername: 'Jpiguave1',
        email: 'jpiguave@mail.com',
        passwordHash,
        status: 'active',
        role: adminRole
    });

    const gestorUser = await ensureUser({
        firstName: 'Maria',
        lastName: 'Loor',
        identification: '0912345678',
        loginUser: 'mloor',
        systemUsername: 'Mloor123',
        email: 'mloor@mail.com',
        passwordHash,
        status: 'active',
        role: gestorRole
    });

    const ensureClient = async (payload: Partial<ClientEntity>) => {
        if (!payload.identification) {
            return null;
        }
        let client = await clientRepo.findOne({ where: { identification: payload.identification } });
        if (!client) {
            client = await clientRepo.save(clientRepo.create(payload));
        }
        return client;
    };

    const companyClient = await ensureClient({
        type: 'company',
        identificationType: 'pasaporte',
        identification: 'P1234567',
        email: 'empresa@demo.com',
        firstName: 'Empresa',
        lastName: 'Demo',
        companyName: 'Demo PYMES',
        companySize: 'pymes',
        phone: '0999999999',
        address: 'Quito',
        status: 'active'
    });

    const personClient = await ensureClient({
        type: 'individual',
        identificationType: 'cedula',
        identification: '1203574901',
        email: 'persona@demo.com',
        firstName: 'Carlos',
        lastName: 'Perez',
        phone: '0988888888',
        address: 'Guayaquil',
        status: 'active'
    });

    if (companyClient) {
        const seguroPymes = await insuranceRepo.findOne({ where: { name: 'Seguro PYMES' } });
        if (seguroPymes) {
            const existing = await clientInsuranceRepo.findOne({
                where: { client: { id: companyClient.id }, insuranceType: { id: seguroPymes.id }, status: 'active' }
            });
            if (!existing) {
                await clientInsuranceRepo.save(
                    clientInsuranceRepo.create({
                        client: companyClient,
                        insuranceType: seguroPymes,
                        status: 'active',
                        amount: 5000,
                        startDate: new Date()
                    })
                );
            }
        }
        const existingService = await clientServiceRepo.findOne({
            where: { client: { id: companyClient.id }, status: 'active' }
        });
        if (!existingService) {
            await clientServiceRepo.save(
                clientServiceRepo.create({
                    client: companyClient,
                    service: asistenciaVial,
                    status: 'active',
                    assignedAt: new Date()
                })
            );
        }
    }

    if (personClient) {
        const seguroAuto = await insuranceRepo.findOne({ where: { name: 'Seguro Auto' } });
        if (seguroAuto) {
            const existing = await clientInsuranceRepo.findOne({
                where: { client: { id: personClient.id }, insuranceType: { id: seguroAuto.id }, status: 'active' }
            });
            if (!existing) {
                await clientInsuranceRepo.save(
                    clientInsuranceRepo.create({
                        client: personClient,
                        insuranceType: seguroAuto,
                        status: 'active',
                        amount: 1000,
                        startDate: new Date()
                    })
                );
            }
        }
        const existingService = await clientServiceRepo.findOne({
            where: { client: { id: personClient.id }, status: 'active' }
        });
        if (!existingService) {
            await clientServiceRepo.save(
                clientServiceRepo.create({
                    client: personClient,
                    service: asistenciaHogar,
                    status: 'active',
                    assignedAt: new Date()
                })
            );
        }
    }

    await AppDataSource.destroy();
    console.log('Seed completado.');
}

seed().catch((error) => {
    console.error('Seed error', error);
    process.exit(1);
});
