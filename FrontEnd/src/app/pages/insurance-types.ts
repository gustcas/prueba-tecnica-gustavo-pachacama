import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { InsuranceTypeService, InsuranceTypeDto } from './service/insurance-type.service';

@Component({
    selector: 'app-insurance-types',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule],
    template: `
        <div class="page-wrap">
            <div class="form-shell">
                <h5>Tipos de seguro</h5>
                <div class="form-grid">
                    <div class="form-field">
                        <label>Nombre</label>
                        <input pInputText [(ngModel)]="form.name" />
                    </div>
                    <div class="form-field">
                        <label>Descripcion</label>
                        <input pInputText [(ngModel)]="form.description" />
                    </div>
                    <div class="form-field">
                        <label>Segmento</label>
                        <p-select [options]="segmentOptions" optionLabel="label" optionValue="value" [(ngModel)]="form.segment" />
                    </div>
                    <div class="form-field">
                        <label>Min</label>
                        <p-inputnumber [(ngModel)]="form.minAmount" [min]="0" mode="currency" currency="USD" />
                    </div>
                    <div class="form-field">
                        <label>Max</label>
                        <p-inputnumber [(ngModel)]="form.maxAmount" [min]="0" mode="currency" currency="USD" />
                    </div>
                </div>
                <div class="form-actions">
                    <p-button label="Crear" (onClick)="createType()"></p-button>
                </div>
            </div>
        </div>

        <div class="card">
            <p-table [value]="items()" [rows]="10" [paginator]="true">
                <ng-template #header>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripcion</th>
                        <th>Segmento</th>
                        <th>Rango</th>
                        <th>Estado</th>
                    </tr>
                </ng-template>
                <ng-template #body let-item>
                    <tr>
                        <td>{{ item.name }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.segment }}</td>
                        <td>{{ item.minAmount }} - {{ item.maxAmount }}</td>
                        <td>{{ item.status }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class InsuranceTypes implements OnInit {
    items = signal<InsuranceTypeDto[]>([]);
    form = { name: '', description: '', segment: 'personal', minAmount: 0, maxAmount: 0 };

    segmentOptions = [
        { label: 'PYMES', value: 'pymes' },
        { label: 'Grandes', value: 'large' },
        { label: 'Personal', value: 'personal' },
        { label: 'Auto', value: 'auto' },
        { label: 'Medico Familiar', value: 'medico_familiar' },
        { label: 'Dental', value: 'dental' },
        { label: 'Poliza', value: 'poliza' }
    ];

    constructor(private insuranceTypeService: InsuranceTypeService, private messageService: MessageService) {}

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.insuranceTypeService.list().subscribe((items) => this.items.set(items));
    }

    createType() {
        if (!this.form.name || !this.form.segment || this.form.minAmount < 0 || this.form.maxAmount <= 0) {
            this.messageService.add({ severity: 'warn', summary: 'Seguros', detail: 'Complete los campos requeridos.' });
            return;
        }
        if (this.form.minAmount > this.form.maxAmount) {
            this.messageService.add({ severity: 'warn', summary: 'Seguros', detail: 'Rango de montos invalido.' });
            return;
        }
        this.insuranceTypeService.create(this.form).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Seguros', detail: 'Tipo creado.' });
                this.form = { name: '', description: '', segment: 'personal', minAmount: 0, maxAmount: 0 };
                this.loadItems();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Seguros', detail: err?.error?.message || 'No se pudo crear.' });
            }
        });
    }
}
