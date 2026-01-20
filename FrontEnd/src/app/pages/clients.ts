import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ClientApiService, ClientDto } from './service/client-api.service';

@Component({
    selector: 'app-clients',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule, DialogModule],
    template: `
        <div class="page-wrap">
            <div class="form-shell">
                <h5>Registrar cliente</h5>
                <div class="form-grid">
                    <div class="form-field">
                        <label>Tipo</label>
                        <p-select [options]="typeOptions" optionLabel="label" optionValue="value" [(ngModel)]="form.type" />
                    </div>
                    <div class="form-field">
                        <label>Identificacion</label>
                        <p-select [options]="idTypeOptions" optionLabel="label" optionValue="value" [(ngModel)]="form.identificationType" />
                    </div>
                    <div class="form-field">
                        <label>Numero</label>
                        <input pInputText [(ngModel)]="form.identification" />
                    </div>
                    <div class="form-field">
                        <label>Email</label>
                        <input pInputText [(ngModel)]="form.email" />
                    </div>
                    <div class="form-field">
                        <label>Nombres</label>
                        <input pInputText [(ngModel)]="form.firstName" />
                    </div>
                    <div class="form-field">
                        <label>Apellidos</label>
                        <input pInputText [(ngModel)]="form.lastName" />
                    </div>
                    <div class="form-field">
                        <label>Empresa</label>
                        <input pInputText [(ngModel)]="form.companyName" />
                    </div>
                    <div class="form-field" *ngIf="form.type === 'company'">
                        <label>Tamano empresa</label>
                        <p-select [options]="companySizeOptions" optionLabel="label" optionValue="value" [(ngModel)]="form.companySize" />
                    </div>
                    <div class="form-field">
                        <label>Telefono</label>
                        <input pInputText [(ngModel)]="form.phone" />
                    </div>
                    <div class="form-field span-2">
                        <label>Direccion</label>
                        <input pInputText [(ngModel)]="form.address" />
                    </div>
                </div>
                <div class="form-actions">
                    <p-button label="Guardar" (onClick)="createClient()"></p-button>
                </div>
            </div>
        </div>

        <div class="card">
            <h5>Clientes</h5>
            <p-table [value]="clients()" [rows]="10" [paginator]="true">
                <ng-template #header>
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Identificacion</th>
                        <th>Email</th>
                        <th>Estado</th>
                        <th></th>
                    </tr>
                </ng-template>
                <ng-template #body let-client>
                    <tr>
                        <td>{{ client.firstName }} {{ client.lastName }}</td>
                        <td>{{ client.type }}</td>
                        <td>{{ client.identification }}</td>
                        <td>{{ client.email }}</td>
                        <td>{{ client.status }}</td>
                        <td>
                            <p-button label="Historial" size="small" (onClick)="openHistory(client)"></p-button>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>

        <p-dialog [(visible)]="historyDialog" [style]="{ width: '70vw' }" header="Historial del cliente" [modal]="true">
            <div class="grid">
                <div class="col-12 md:col-6">
                    <h6>Polizas</h6>
                    <p-table [value]="historyInsurances()" [rows]="5" [paginator]="true">
                        <ng-template #header>
                            <tr>
                                <th>Seguro</th>
                                <th>Estado</th>
                                <th>Monto</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-item>
                            <tr>
                                <td>{{ item.insuranceType?.name }}</td>
                                <td>{{ item.status }}</td>
                                <td>{{ item.amount }}</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
                <div class="col-12 md:col-6">
                    <h6>Servicios</h6>
                    <p-table [value]="historyServices()" [rows]="5" [paginator]="true">
                        <ng-template #header>
                            <tr>
                                <th>Servicio</th>
                                <th>Estado</th>
                                <th>Asignado</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-item>
                            <tr>
                                <td>{{ item.service?.name }}</td>
                                <td>{{ item.status }}</td>
                                <td>{{ item.assignedAt | date: 'short' }}</td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>
        </p-dialog>
    `
})
export class Clients implements OnInit {
    clients = signal<ClientDto[]>([]);
    historyInsurances = signal<any[]>([]);
    historyServices = signal<any[]>([]);
    historyDialog = false;

    form = {
        type: 'individual',
        identificationType: 'cedula',
        identification: '',
        email: '',
        firstName: '',
        lastName: '',
        companyName: '',
        companySize: '',
        phone: '',
        address: ''
    };

    typeOptions = [
        { label: 'Persona', value: 'individual' },
        { label: 'Empresa', value: 'company' }
    ];

    idTypeOptions = [
        { label: 'Cedula', value: 'cedula' },
        { label: 'Pasaporte', value: 'pasaporte' }
    ];

    companySizeOptions = [
        { label: 'PYMES', value: 'pymes' },
        { label: 'Grandes', value: 'large' }
    ];

    constructor(private clientService: ClientApiService, private messageService: MessageService) {}

    ngOnInit() {
        this.loadClients();
    }

    loadClients() {
        this.clientService.list().subscribe((items) => this.clients.set(items));
    }

    createClient() {
        if (!this.form.identification || !this.form.email || !this.form.firstName || !this.form.lastName) {
            this.messageService.add({ severity: 'warn', summary: 'Clientes', detail: 'Complete los campos requeridos.' });
            return;
        }
        if (this.form.type === 'company' && (!this.form.companyName || !this.form.companySize)) {
            this.messageService.add({ severity: 'warn', summary: 'Clientes', detail: 'Complete los datos de la empresa.' });
            return;
        }
        this.clientService.create(this.form as any).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Clientes', detail: 'Cliente registrado.' });
                this.form = {
                    type: 'individual',
                    identificationType: 'cedula',
                    identification: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    companyName: '',
                    companySize: '',
                    phone: '',
                    address: ''
                };
                this.loadClients();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Clientes', detail: err?.error?.message || 'No se pudo registrar.' });
            }
        });
    }

    openHistory(client: ClientDto) {
        this.clientService.history(client.id).subscribe((history) => {
            this.historyInsurances.set(history.insurances || []);
            this.historyServices.set(history.services || []);
            this.historyDialog = true;
        });
    }
}
