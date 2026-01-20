import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
    id: string;
    email: string;
    systemUsername: string;
    role?: string;
    roleId?: string;
}

export interface LoginResponse {
    ok: boolean;
    token: string;
    user: AuthUser;
    sessionId: string;
}

export interface SessionSummary {
    lastSession: { startedAt: string; endedAt?: string | null; isActive: boolean } | null;
    failedAttempts: number;
    lastFailedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiBase = 'http://localhost:3001/api';

    constructor(private http: HttpClient) {}

    login(identifier: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiBase}/auth/login`, { identifier, password }).pipe(
            tap((response) => {
                localStorage.setItem('token', response.token);
                localStorage.setItem('sessionId', response.sessionId);
                localStorage.setItem('user', JSON.stringify(response.user));
            })
        );
    }

    logout(): Observable<{ ok: boolean }> {
        const sessionId = localStorage.getItem('sessionId');
        return this.http.post<{ ok: boolean }>(`${this.apiBase}/auth/logout`, { sessionId }).pipe(
            tap(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('sessionId');
                localStorage.removeItem('user');
            })
        );
    }

    forgotPassword(email: string) {
        return this.http.post(`${this.apiBase}/auth/forgot-password`, { email });
    }

    getSessionSummary() {
        return this.http.get<SessionSummary>(`${this.apiBase}/auth/me/summary`);
    }

    get token() {
        return localStorage.getItem('token');
    }

    get user(): AuthUser | null {
        const raw = localStorage.getItem('user');
        return raw ? (JSON.parse(raw) as AuthUser) : null;
    }
}
