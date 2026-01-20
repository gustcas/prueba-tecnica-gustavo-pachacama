import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../service/dashboard.service';

@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    template: `<div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Clientes</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ metrics().totalClients }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-users text-blue-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Total </span>
                <span class="text-muted-color">registrados</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Polizas activas</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ metrics().totalClientInsurances }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-file text-orange-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Total </span>
                <span class="text-muted-color">seguros contratados</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Servicios</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ metrics().totalServices }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-briefcase text-cyan-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Catalogo </span>
                <span class="text-muted-color">disponible</span>
            </div>
        </div>
        <div class="col-span-12 lg:col-span-6 xl:col-span-3">
            <div class="card mb-0">
                <div class="flex justify-between mb-4">
                    <div>
                        <span class="block text-muted-color font-medium mb-4">Logins fallidos</span>
                        <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ metrics().failedLogins }}</div>
                    </div>
                    <div class="flex items-center justify-center bg-purple-100 dark:bg-purple-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                        <i class="pi pi-lock text-purple-500 text-xl!"></i>
                    </div>
                </div>
                <span class="text-primary font-medium">Intentos </span>
                <span class="text-muted-color">registrados</span>
            </div>
        </div>`
})
export class StatsWidget implements OnInit {
    metrics = signal({
        totalClients: 0,
        totalInsuranceTypes: 0,
        totalClientInsurances: 0,
        failedLogins: 0,
        totalServices: 0,
        totalUsers: 0
    });

    constructor(private dashboardService: DashboardService) {}

    ngOnInit() {
        this.dashboardService.getMetrics().subscribe((metrics) => this.metrics.set(metrics));
    }
}
