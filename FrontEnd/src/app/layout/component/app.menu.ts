import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { MenuService } from '../../pages/service/menu.service';
import { AuthService } from '../../pages/service/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    constructor(private menuService: MenuService, private authService: AuthService) {}

    ngOnInit() {
        const roleId = this.authService.user?.roleId;
        if (!roleId) {
            this.model = [{ label: 'Auth', items: [{ label: 'Login', icon: 'pi pi-fw pi-sign-in', routerLink: ['/auth/login'] }] }];
            return;
        }

        this.menuService.getMenusForRole(roleId).subscribe((items) => {
            this.model = items;
        });
    }
}
