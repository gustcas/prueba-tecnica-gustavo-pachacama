import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ClientApiService, ClientDto } from './service/client-api.service';
import { ServiceCatalogApiService, ServiceDto } from './service/service-catalog.service';
import { ClientServiceAssignmentApiService } from './service/client-service-assignment.service';

@Component({
    selector: 'app-client-services',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, TableModule],
    template: `
        <div class="card">
            <h5>Gestion de servicios</h5>
            <div class="grid mb-4">
                <div class="col-12 md:col-4">
                    <label class="block mb-2">Cliente</label>
                    <p-select [options]="clients()" optionLabel="email" optionValue="id" [(ngModel)]="selectedClientId" (onChange)="loadHistory()" />
                </div>
                <div class="col-12 md:col-4">
                    <label class="block mb-2">Servicio</label>
                    <p-select [options]="services()" optionLabel="name" optionValue="id" [(ngModel)]="selectedServiceId" />
                </div>
                <div class="col-12 md:col-4 flex items-end gap-2">
                    <p-button label="Asignar" (onClick)="assign()"></p-button>
                    <p-button label="Cancelar" severity="danger" (onClick)="cancel()"></p-button>
                </div>
            </div>

            <div class="grid mb-4">
                <div class="col-12 md:col-4">
                    <label class="block mb-2">Servicio actual</label>
                    <p-select [options]="services()" optionLabel="name" optionValue="id" [(ngModel)]="reassign.currentServiceId" />
                </div>
                <div class="col-12 md:col-4">
                    <label class="block mb-2">Nuevo servicio</label>
                    <p-select [options]="services()" optionLabel="name" optionValue="id" [(ngModel)]="reassign.newServiceId" />
                </div>
                <div class="col-12 md:col-4 flex items-end">
                    <p-button label="Reasignar" severity="secondary" (onClick)="reassignService()"></p-button>
                </div>
            </div>

            <p-table [value]="historyServices()" [rows]="10" [paginator]="true">
                <ng-template #header>
                    <tr>
                        <th>Servicio</th>
                        <th>Estado</th>
                        <th>Asignado</th>
                        <th>Cancelado</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{ item.service?.name }}</td>
                        <td>{{ item.status }}</td>
                        <td>{{ item.assignedAt | date: 'short' }}</td>
                        <td>{{ item.cancelledAt ? (item.cancelledAt | date: 'short') : '-' }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class ClientServices implements OnInit {
    clients = signal<ClientDto[]>([]);
    services = signal<ServiceDto[]>([]);
    historyServices = signal<any[]>([]);

    selectedClientId = '';
    selectedServiceId = '';

    reassign = {
        currentServiceId: '',
        newServiceId: ''
    };

    constructor(
        private clientService: ClientApiService,
        private serviceCatalog: ServiceCatalogApiService,
        private assignmentService: ClientServiceAssignmentApiService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.clientService.list().subscribe((clients) => this.clients.set(clients));
        this.serviceCatalog.list().subscribe((services) => this.services.set(services));
    }

    loadHistory() {
        if (!this.selectedClientId) {
            return;
        }
        this.clientService.history(this.selectedClientId).subscribe((history) => {
            this.historyServices.set(history.services || []);
        });
    }

    assign() {
        if (!this.selectedClientId || !this.selectedServiceId) {
            this.messageService.add({ severity: 'warn', summary: 'Servicios', detail: 'Seleccione cliente y servicio.' });
            return;
        }
        this.assignmentService.assign(this.selectedClientId, this.selectedServiceId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Servicios', detail: 'Servicio asignado.' });
                this.loadHistory();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Servicios', detail: err?.error?.message || 'No se pudo asignar.' });
            }
        });
    }

    reassignService() {
        if (!this.selectedClientId || !this.reassign.currentServiceId || !this.reassign.newServiceId) {
            this.messageService.add({ severity: 'warn', summary: 'Servicios', detail: 'Complete los campos de reasignacion.' });
            return;
        }
        this.assignmentService.reassign(this.selectedClientId, this.reassign.currentServiceId, this.reassign.newServiceId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Servicios', detail: 'Servicio reasignado.' });
                this.loadHistory();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Servicios', detail: err?.error?.message || 'No se pudo reasignar.' });
            }
        });
    }

    cancel() {
        if (!this.selectedClientId || !this.selectedServiceId) {
            this.messageService.add({ severity: 'warn', summary: 'Servicios', detail: 'Seleccione cliente y servicio.' });
            return;
        }
        this.assignmentService.cancel(this.selectedClientId, this.selectedServiceId).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Servicios', detail: 'Servicio cancelado.' });
                this.loadHistory();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Servicios', detail: err?.error?.message || 'No se pudo cancelar.' });
            }
        });
    }
}
