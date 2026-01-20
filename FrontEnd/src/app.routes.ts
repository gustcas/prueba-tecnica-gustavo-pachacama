import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { roleGuard } from './app/pages/service/role.guard';
import { AdminUsers } from './app/pages/admin-users';
import { AdminRoles } from './app/pages/admin-roles';
import { AdminMenus } from './app/pages/admin-menus';

export const appRoutes: Routes = [
    { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'dashboard', component: Dashboard, canMatch: [roleGuard(['gestor', 'admin'])] },
            { path: 'admin/users', component: AdminUsers, canMatch: [roleGuard(['admin'])] },
            { path: 'admin/roles', component: AdminRoles, canMatch: [roleGuard(['admin'])] },
            { path: 'admin/menus', component: AdminMenus, canMatch: [roleGuard(['admin'])] },
            { path: 'admin/insurance-types', loadComponent: () => import('./app/pages/insurance-types').then((m) => m.InsuranceTypes), canMatch: [roleGuard(['admin'])] },
            { path: 'admin/services', loadComponent: () => import('./app/pages/services').then((m) => m.Services), canMatch: [roleGuard(['admin'])] },
            { path: 'clients', loadComponent: () => import('./app/pages/clients').then((m) => m.Clients), canMatch: [roleGuard(['gestor', 'admin'])] },
            { path: 'client-insurances', loadComponent: () => import('./app/pages/client-insurances').then((m) => m.ClientInsurances), canMatch: [roleGuard(['gestor', 'admin'])] },
            { path: 'client-services', loadComponent: () => import('./app/pages/client-services').then((m) => m.ClientServices), canMatch: [roleGuard(['gestor', 'admin'])] },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes').then((m) => m.default) },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes').then((m) => m.default) }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes').then((m) => m.default) },
    { path: '**', redirectTo: '/notfound' }
];
