import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const messageService = inject(MessageService);

    const token = authService.token;
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    if (!token && req.url.includes('/api/')) {
        console.warn('[auth] Sin token para', req.method, req.url);
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status === 0) {
                messageService.add({ severity: 'error', summary: 'API', detail: 'Servicio no disponible' });
            } else if (error.status === 401) {
                messageService.add({ severity: 'warn', summary: 'Sesion', detail: 'Token ausente o expirado. Vuelve a iniciar sesion.' });
            } else if (error.status === 403) {
                messageService.add({ severity: 'warn', summary: 'Acceso', detail: 'No tienes permisos para esta accion.' });
            }
            throw error;
        })
    );
};
