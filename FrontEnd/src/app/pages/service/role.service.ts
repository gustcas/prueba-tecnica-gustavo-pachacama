import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RoleDto {
    id: string;
    name: string;
    description?: string;
}

@Injectable({ providedIn: 'root' })
export class RoleService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    list() {
        return this.http.get<RoleDto[]>(`${this.apiBase}/roles`);
    }

    create(payload: { name: string; description?: string }) {
        return this.http.post<RoleDto>(`${this.apiBase}/roles`, payload);
    }
}
