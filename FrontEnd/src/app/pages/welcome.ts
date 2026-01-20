import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AuthService, SessionSummary, AuthUser } from './service/auth.service';

@Component({
    selector: 'app-welcome',
    standalone: true,
    imports: [CommonModule, CardModule],
    template: `
        <div class="grid">
            <div class="col-12 md:col-6">
                <p-card header="Bienvenido">
                    <div class="flex flex-col gap-2">
                        <div><strong>Usuario:</strong> {{ user()?.systemUsername }}</div>
                        <div><strong>Email:</strong> {{ user()?.email }}</div>
                        <div><strong>Rol:</strong> {{ user()?.role }}</div>
                    </div>
                </p-card>
            </div>
            <div class="col-12 md:col-6">
                <p-card header="Ultima sesion">
                    <div class="flex flex-col gap-2" *ngIf="summary() as s">
                        <div><strong>Inicio:</strong> {{ s.lastSession?.startedAt ? (s.lastSession?.startedAt | date: 'short') : '-' }}</div>
                        <div><strong>Fin:</strong> {{ s.lastSession?.endedAt ? (s.lastSession?.endedAt | date: 'short') : '-' }}</div>
                        <div><strong>Activa:</strong> {{ s.lastSession?.isActive ? 'Si' : 'No' }}</div>
                        <div><strong>Intentos fallidos:</strong> {{ s.failedAttempts }}</div>
                        <div><strong>Ultimo fallo:</strong> {{ s.lastFailedAt ? (s.lastFailedAt | date: 'short') : '-' }}</div>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class Welcome implements OnInit {
    user = signal<AuthUser | null>(null);
    summary = signal<SessionSummary | null>(null);

    constructor(private authService: AuthService) {
        this.user.set(this.authService.user);
    }

    ngOnInit() {
        this.authService.getSessionSummary().subscribe((summary) => this.summary.set(summary));
    }
}
