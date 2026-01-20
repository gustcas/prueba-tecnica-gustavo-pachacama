import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ClientInsuranceDto {
    id: string;
    client: { id: string; firstName: string; lastName: string; email: string; type: string };
    insuranceType: { id: string; name: string };
    amount: number;
    status: string;
}

@Injectable({ providedIn: 'root' })
export class ClientInsuranceService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    list() {
        return this.http.get<ClientInsuranceDto[]>(`${this.apiBase}/client-insurances`);
    }

    create(payload: { clientId: string; insuranceTypeId: string; amount: number }) {
        return this.http.post<ClientInsuranceDto>(`${this.apiBase}/client-insurances`, payload);
    }

    update(id: string, payload: Partial<ClientInsuranceDto>) {
        return this.http.patch<ClientInsuranceDto>(`${this.apiBase}/client-insurances/${id}`, payload);
    }
}
