import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { AuthService } from './auth.service';

export interface MenuDto {
    id: string;
    label: string;
    icon?: string | null;
    routerLink?: string | null;
    parentId?: string | null;
    order: number;
}

@Injectable({ providedIn: 'root' })
export class MenuService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient, private authService: AuthService) {}

    getMenusForRole(roleId: string) {
        return this.http.get<MenuDto[]>(`${this.apiBase}/roles/${roleId}/menus`).pipe(map((items) => this.toMenuItems(items)));
    }

    getMenusForCurrentUser() {
        const roleId = this.authService.user?.roleId;
        if (!roleId) {
            return [] as MenuItem[];
        }
        let items: MenuItem[] = [];
        this.getMenusForRole(roleId).subscribe((result) => {
            items = result;
        });
        return items;
    }

    list() {
        return this.http.get<MenuDto[]>(`${this.apiBase}/menus`);
    }

    create(payload: { label: string; icon?: string; routerLink?: string; parentId?: string; order?: number }) {
        return this.http.post<MenuDto>(`${this.apiBase}/menus`, payload);
    }

    private toMenuItems(items: MenuDto[]): MenuItem[] {
        const byParent = new Map<string | null, MenuDto[]>();
        items.forEach((item) => {
            const key = item.parentId || null;
            const list = byParent.get(key) || [];
            list.push(item);
            byParent.set(key, list);
        });

        const build = (parentId: string | null): MenuItem[] => {
            const list = byParent.get(parentId) || [];
            return list
                .sort((a, b) => a.order - b.order)
                .map((menu) => {
                    const children = build(menu.id);
                    return {
                        label: menu.label,
                        icon: menu.icon || undefined,
                        routerLink: menu.routerLink ? [menu.routerLink] : undefined,
                        items: children.length > 0 ? children : undefined
                    };
                });
        };

        return build(null);
    }
}
