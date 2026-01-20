import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { UserService, UserDto } from './service/user.service';
import { RoleService, RoleDto } from './service/role.service';

@Component({
    selector: 'app-admin-users',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule, TagModule],
    template: `
        <div class="flex flex-col gap-6">
            <div class="page-wrap">
                <div class="form-shell">
                    <h5>Crear usuario</h5>
                    <div class="form-grid">
                        <div class="form-field">
                            <label>Nombres</label>
                            <input pInputText [(ngModel)]="form.firstName" />
                        </div>
                        <div class="form-field">
                            <label>Apellidos</label>
                            <input pInputText [(ngModel)]="form.lastName" />
                        </div>
                        <div class="form-field">
                            <label>Identificacion</label>
                            <input pInputText [(ngModel)]="form.identification" />
                        </div>
                        <div class="form-field">
                            <label>Password</label>
                            <input pInputText type="password" [(ngModel)]="form.password" />
                        </div>
                        <div class="form-field">
                            <label>Rol</label>
                            <p-select [options]="roles()" optionLabel="name" optionValue="id" [(ngModel)]="form.roleId" placeholder="Seleccione" />
                        </div>
                    </div>
                    <div class="form-actions">
                        <p-button label="Crear" (onClick)="createUser()"></p-button>
                    </div>
                </div>
            </div>

            <div class="card">
                <h5>Usuarios</h5>
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <span class="font-medium">Filtro</span>
                        <input pInputText type="text" class="w-full" placeholder="Buscar..." (input)="onGlobalFilter($event)" />
                    </div>
                    <div class="flex items-center gap-3">
                        <p-select [options]="roles()" optionLabel="name" optionValue="name" placeholder="Rol" (onChange)="onRoleFilter($event)" styleClass="w-full" />
                        <p-select [options]="statusOptions" optionLabel="label" optionValue="value" placeholder="Estado" (onChange)="onStatusFilter($event)" styleClass="w-full" />
                    </div>
                </div>
                <p-table #dt [value]="users()" [rows]="10" [paginator]="true" [rowsPerPageOptions]="[10,20]" [globalFilterFields]="['firstName','lastName','email','systemUsername','status','role.name']">
                    <ng-template #header>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th></th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-user>
                        <tr>
                            <td>{{ user.firstName }} {{ user.lastName }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.systemUsername }}</td>
                            <td>
                                <p-select [options]="roles()" optionLabel="name" optionValue="id" [(ngModel)]="user.role.id" styleClass="w-full"></p-select>
                            </td>
                            <td>
                                <p-select [options]="statusOptions" optionLabel="label" optionValue="value" [(ngModel)]="user.status" styleClass="w-full"></p-select>
                            </td>
                            <td>
                                <p-button label="Guardar" (onClick)="saveUser(user)" size="small"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `
})
export class AdminUsers implements OnInit {
    @ViewChild('dt') dt!: Table;
    users = signal<UserDto[]>([]);
    roles = signal<RoleDto[]>([]);

    form = {
        firstName: '',
        lastName: '',
        identification: '',
        password: '',
        roleId: ''
    };

    statusOptions = [
        { label: 'Activo', value: 'active' },
        { label: 'Bloqueado', value: 'blocked' },
        { label: 'Inactivo', value: 'inactive' }
    ];

    constructor(private userService: UserService, private roleService: RoleService, private messageService: MessageService) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.roleService.list().subscribe((roles) => this.roles.set(roles));
        this.userService.list().subscribe((users) => this.users.set(users));
    }

    createUser() {
        if (!this.form.firstName || !this.form.lastName || !this.form.identification || !this.form.password || !this.form.roleId) {
            this.messageService.add({ severity: 'warn', summary: 'Usuarios', detail: 'Complete los campos requeridos.' });
            return;
        }
        this.userService.create(this.form).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Usuarios', detail: 'Usuario creado.' });
                this.form = { firstName: '', lastName: '', identification: '', password: '', roleId: '' };
                this.loadData();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Usuarios', detail: err?.error?.message || 'No se pudo crear.' });
            }
        });
    }

    saveUser(user: UserDto) {
        this.userService.update(user.id, { status: user.status, roleId: user.role?.id }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Usuarios', detail: 'Usuario actualizado.' });
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Usuarios', detail: err?.error?.message || 'No se pudo actualizar.' });
            }
        });
    }

    onGlobalFilter(event: Event) {
        if (!this.dt) {
            return;
        }
        const value = (event.target as HTMLInputElement).value;
        this.dt.filterGlobal(value, 'contains');
    }

    onRoleFilter(event: { value: string }) {
        if (!this.dt) {
            return;
        }
        this.dt.filter(event.value || '', 'role.name', 'equals');
    }

    onStatusFilter(event: { value: string }) {
        if (!this.dt) {
            return;
        }
        this.dt.filter(event.value || '', 'status', 'equals');
    }
}
