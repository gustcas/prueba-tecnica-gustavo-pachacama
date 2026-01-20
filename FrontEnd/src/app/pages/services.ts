import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ServiceCatalogApiService, ServiceDto } from './service/service-catalog.service';

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule],
    template: `
        <div class="page-wrap">
            <div class="form-shell">
                <h5>Servicios</h5>
                <div class="form-grid">
                    <div class="form-field">
                        <label>Nombre</label>
                        <input pInputText [(ngModel)]="form.name" />
                    </div>
                    <div class="form-field">
                        <label>Descripcion</label>
                        <input pInputText [(ngModel)]="form.description" />
                    </div>
                </div>
                <div class="form-actions">
                    <p-button label="Crear" (onClick)="createService()"></p-button>
                </div>
            </div>
        </div>

        <div class="card">
            <p-table [value]="items()" [rows]="10" [paginator]="true">
                <ng-template #header>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripcion</th>
                        <th>Estado</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{ item.name }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.status }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class Services implements OnInit {
    items = signal<ServiceDto[]>([]);
    form = { name: '', description: '' };

    constructor(private serviceCatalogService: ServiceCatalogApiService, private messageService: MessageService) {}

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.serviceCatalogService.list().subscribe((items) => this.items.set(items));
    }

    createService() {
        this.serviceCatalogService.create(this.form).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Servicios', detail: 'Servicio creado.' });
                this.form = { name: '', description: '' };
                this.loadItems();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Servicios', detail: err?.error?.message || 'No se pudo crear.' });
            }
        });
    }
}
