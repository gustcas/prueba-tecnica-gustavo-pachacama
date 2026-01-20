import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ClientInsuranceService, ClientInsuranceDto } from './service/client-insurance.service';
import { ClientApiService, ClientDto } from './service/client-api.service';
import { InsuranceTypeService, InsuranceTypeDto } from './service/insurance-type.service';

@Component({
    selector: 'app-client-insurances',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule, InputNumberModule],
    template: `
        <div class="card">
            <h5>Asignar poliza</h5>
            <div class="grid mb-4">
                <div class="col-12 md:col-5">
                    <label class="block mb-2">Cliente</label>
                    <p-select [options]="clients()" optionLabel="email" optionValue="id" [(ngModel)]="form.clientId" />
                </div>
                <div class="col-12 md:col-5">
                    <label class="block mb-2">Tipo de seguro</label>
                    <p-select [options]="types()" optionLabel="name" optionValue="id" [(ngModel)]="form.insuranceTypeId" />
                </div>
                <div class="col-12 md:col-2">
                    <label class="block mb-2">Monto</label>
                    <p-inputnumber [(ngModel)]="form.amount" [min]="0" mode="currency" currency="USD" />
                </div>
                <div class="col-12 md:col-2 flex items-end">
                    <p-button label="Asignar" (onClick)="assign()"></p-button>
                </div>
            </div>

            <p-table [value]="items()" [rows]="10" [paginator]="true">
                <ng-template #header>
                    <tr>
                        <th>Cliente</th>
                        <th>Seguro</th>
                        <th>Monto</th>
                        <th>Estado</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{ item.client.email }}</td>
                        <td>{{ item.insuranceType.name }}</td>
                        <td>{{ item.amount }}</td>
                        <td>{{ item.status }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class ClientInsurances implements OnInit {
    items = signal<ClientInsuranceDto[]>([]);
    clients = signal<ClientDto[]>([]);
    types = signal<InsuranceTypeDto[]>([]);

    form = { clientId: '', insuranceTypeId: '', amount: 0 };

    constructor(
        private clientInsuranceService: ClientInsuranceService,
        private clientService: ClientApiService,
        private insuranceTypeService: InsuranceTypeService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.clientService.list().subscribe((clients) => this.clients.set(clients));
        this.insuranceTypeService.list().subscribe((types) => this.types.set(types));
        this.clientInsuranceService.list().subscribe((items) => this.items.set(items));
    }

    assign() {
        if (!this.form.clientId || !this.form.insuranceTypeId || this.form.amount <= 0) {
            this.messageService.add({ severity: 'warn', summary: 'Polizas', detail: 'Complete los campos requeridos.' });
            return;
        }
        this.clientInsuranceService.create(this.form).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Polizas', detail: 'Asignado.' });
                this.form = { clientId: '', insuranceTypeId: '', amount: 0 };
                this.loadData();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Polizas', detail: err?.error?.message || 'No se pudo asignar.' });
            }
        });
    }
}
