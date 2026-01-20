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

    return next(authReq).pipe(
        catchError((error) => {
            if (error.status === 0) {
                messageService.add({ severity: 'error', summary: 'API', detail: 'Servicio no disponible' });
            }
            throw error;
        })
    );
};
