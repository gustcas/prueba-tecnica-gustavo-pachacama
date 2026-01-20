import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ClientServiceAssignmentApiService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    assign(clientId: string, serviceId: string) {
        return this.http.post(`${this.apiBase}/clients/${clientId}/services/assign`, { serviceId });
    }

    reassign(clientId: string, currentServiceId: string, newServiceId: string) {
        return this.http.post(`${this.apiBase}/clients/${clientId}/services/reassign`, { currentServiceId, newServiceId });
    }

    cancel(clientId: string, serviceId: string) {
        return this.http.post(`${this.apiBase}/clients/${clientId}/services/cancel`, { serviceId });
    }
}
