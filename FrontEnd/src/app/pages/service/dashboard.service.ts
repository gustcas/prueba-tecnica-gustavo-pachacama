import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface DashboardMetrics {
    totalClients: number;
    totalInsuranceTypes: number;
    totalClientInsurances: number;
    failedLogins: number;
    totalServices: number;
    totalUsers: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    getMetrics() {
        return this.http.get<DashboardMetrics>(`${this.apiBase}/dashboard/metrics`);
    }
}
