import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface UserDto {
    id: string;
    firstName: string;
    lastName: string;
    identification?: string;
    email: string;
    systemUsername: string;
    status: string;
    role?: { id: string; name: string };
}

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    list() {
        return this.http.get<UserDto[]>(`${this.apiBase}/users`);
    }

    create(payload: { firstName: string; lastName: string; identification: string; password: string; roleId: string }) {
        return this.http.post<UserDto>(`${this.apiBase}/users`, payload);
    }

    update(id: string, payload: { status?: string; roleId?: string }) {
        return this.http.patch<UserDto>(`${this.apiBase}/users/${id}`, payload);
    }
}
