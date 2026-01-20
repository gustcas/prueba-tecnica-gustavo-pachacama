import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface InsuranceTypeDto {
    id: string;
    name: string;
    description?: string | null;
    segment: string;
    minAmount: number;
    maxAmount: number;
    status: string;
}

@Injectable({ providedIn: 'root' })
export class InsuranceTypeService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    list() {
        return this.http.get<InsuranceTypeDto[]>(`${this.apiBase}/insurance-types`);
    }

    create(payload: { name: string; description?: string; segment: string; minAmount: number; maxAmount: number }) {
        return this.http.post<InsuranceTypeDto>(`${this.apiBase}/insurance-types`, payload);
    }

    update(id: string, payload: Partial<InsuranceTypeDto>) {
        return this.http.patch<InsuranceTypeDto>(`${this.apiBase}/insurance-types/${id}`, payload);
    }
}
