import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { RoleService, RoleDto } from './service/role.service';

@Component({
    selector: 'app-admin-roles',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule],
    template: `
        <div class="page-wrap">
            <div class="form-shell">
                <h5>Roles</h5>
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
                    <p-button label="Crear" (onClick)="createRole()"></p-button>
                </div>
            </div>
        </div>

        <div class="card">
            <p-table [value]="roles()" [rows]="10" [paginator]="true">
                <ng-template #header>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripcion</th>
                    </tr>
                </ng-template>
                <ng-template #body let-role>
                    <tr>
                        <td>{{ role.name }}</td>
                        <td>{{ role.description }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class AdminRoles implements OnInit {
    roles = signal<RoleDto[]>([]);
    form = { name: '', description: '' };

    constructor(private roleService: RoleService, private messageService: MessageService) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.roleService.list().subscribe((roles) => this.roles.set(roles));
    }

    createRole() {
        this.roleService.create(this.form).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Roles', detail: 'Rol creado.' });
                this.form = { name: '', description: '' };
                this.loadData();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Roles', detail: err?.error?.message || 'No se pudo crear.' });
            }
        });
    }
}
