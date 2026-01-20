import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ServiceDto {
    id: string;
    name: string;
    description?: string | null;
    status: string;
}

@Injectable({ providedIn: 'root' })
export class ServiceCatalogApiService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    list() {
        return this.http.get<ServiceDto[]>(`${this.apiBase}/services`);
    }

    create(payload: { name: string; description?: string }) {
        return this.http.post<ServiceDto>(`${this.apiBase}/services`, payload);
    }

    update(id: string, payload: Partial<ServiceDto>) {
        return this.http.patch<ServiceDto>(`${this.apiBase}/services/${id}`, payload);
    }
}
