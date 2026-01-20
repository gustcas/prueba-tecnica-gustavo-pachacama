import 'dotenv/config';
import { AppDataSource } from './infrastructure/db/data-source';
import { RoleEntity } from './infrastructure/db/entities/RoleEntity';
import { MenuEntity } from './infrastructure/db/entities/MenuEntity';
import { RoleMenuEntity } from './infrastructure/db/entities/RoleMenuEntity';
import { InsuranceTypeEntity } from './infrastructure/db/entities/InsuranceTypeEntity';

async function seed() {
    await AppDataSource.initialize();

    const roleRepo = AppDataSource.getRepository(RoleEntity);
    const menuRepo = AppDataSource.getRepository(MenuEntity);
    const roleMenuRepo = AppDataSource.getRepository(RoleMenuEntity);
    const insuranceRepo = AppDataSource.getRepository(InsuranceTypeEntity);

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
    const welcome = await ensureMenu('Welcome', '/welcome', 'pi pi-fw pi-user', general.id, 1);

    const users = await ensureMenu('Usuarios', '/admin/users', 'pi pi-fw pi-users', admin.id, 0);
    const roles = await ensureMenu('Roles', '/admin/roles', 'pi pi-fw pi-shield', admin.id, 1);
    const menus = await ensureMenu('Menus', '/admin/menus', 'pi pi-fw pi-list', admin.id, 2);
    const insuranceTypes = await ensureMenu('Tipos de seguro', '/admin/insurance-types', 'pi pi-fw pi-book', admin.id, 3);
    const services = await ensureMenu('Servicios', '/admin/services', 'pi pi-fw pi-briefcase', admin.id, 4);

    const clients = await ensureMenu('Clientes', '/clients', 'pi pi-fw pi-id-card', gestor.id, 0);
    const clientInsurances = await ensureMenu('Polizas', '/client-insurances', 'pi pi-fw pi-file', gestor.id, 1);
    const clientServices = await ensureMenu('Servicios cliente', '/client-services', 'pi pi-fw pi-wrench', gestor.id, 2);

    const adminMenus = [general, admin, dashboard, welcome, users, roles, menus, insuranceTypes, services, gestor, clients, clientInsurances, clientServices];
    const gestorMenus = [general, dashboard, welcome, gestor, clients, clientInsurances, clientServices];

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

    await AppDataSource.destroy();
    console.log('Seed completado.');
}

seed().catch((error) => {
    console.error('Seed error', error);
    process.exit(1);
});
