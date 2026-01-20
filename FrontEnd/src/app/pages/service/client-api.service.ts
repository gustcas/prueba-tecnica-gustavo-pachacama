import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ClientDto {
    id: string;
    type: 'individual' | 'company';
    identificationType: 'cedula' | 'pasaporte';
    identification: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string | null;
    companySize?: 'pymes' | 'large' | null;
    phone?: string | null;
    address?: string | null;
    status: string;
}

@Injectable({ providedIn: 'root' })
export class ClientApiService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    list() {
        return this.http.get<ClientDto[]>(`${this.apiBase}/clients`);
    }

    create(payload: Omit<ClientDto, 'id' | 'status'>) {
        return this.http.post<ClientDto>(`${this.apiBase}/clients`, payload);
    }

    update(id: string, payload: Partial<ClientDto>) {
        return this.http.patch<ClientDto>(`${this.apiBase}/clients/${id}`, payload);
    }

    history(id: string) {
        return this.http.get<{ insurances: any[]; services: any[] }>(`${this.apiBase}/clients/${id}/history`);
    }
}
