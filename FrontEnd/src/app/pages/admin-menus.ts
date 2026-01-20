import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { MenuService, MenuDto } from './service/menu.service';

@Component({
    selector: 'app-admin-menus',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, InputNumberModule],
    template: `
        <div class="card">
            <h5>Menus</h5>
            <div class="grid mb-4">
                <div class="col-12 md:col-3">
                    <label class="block mb-2">Label</label>
                    <input pInputText [(ngModel)]="form.label" />
                </div>
                <div class="col-12 md:col-3">
                    <label class="block mb-2">Icono</label>
                    <input pInputText [(ngModel)]="form.icon" placeholder="pi pi-fw pi-home" />
                </div>
                <div class="col-12 md:col-3">
                    <label class="block mb-2">RouterLink</label>
                    <input pInputText [(ngModel)]="form.routerLink" placeholder="/welcome" />
                </div>
                <div class="col-12 md:col-2">
                    <label class="block mb-2">Orden</label>
                    <p-inputnumber [(ngModel)]="form.order" [min]="0"></p-inputnumber>
                </div>
                <div class="col-12 md:col-1 flex items-end">
                    <p-button label="Crear" (onClick)="createMenu()"></p-button>
                </div>
            </div>

            <p-table [value]="menus()" [rows]="10" [paginator]="true">
                <ng-template #header>
                    <tr>
                        <th>Label</th>
                        <th>Icono</th>
                        <th>Link</th>
                        <th>Orden</th>
                    </tr>
                </ng-template>
                <ng-template #body let-menu>
                    <tr>
                        <td>{{ menu.label }}</td>
                        <td>{{ menu.icon }}</td>
                        <td>{{ menu.routerLink }}</td>
                        <td>{{ menu.order }}</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class AdminMenus implements OnInit {
    menus = signal<MenuDto[]>([]);
    form = { label: '', icon: '', routerLink: '', order: 0 };

    constructor(private menuService: MenuService, private messageService: MessageService) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.menuService.list().subscribe((menus) => this.menus.set(menus));
    }

    createMenu() {
        this.menuService.create(this.form).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Menus', detail: 'Menu creado.' });
                this.form = { label: '', icon: '', routerLink: '', order: 0 };
                this.loadData();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Menus', detail: err?.error?.message || 'No se pudo crear.' });
            }
        });
    }
}
