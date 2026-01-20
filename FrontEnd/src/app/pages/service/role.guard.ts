import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const roleGuard = (roles: string[]): CanMatchFn => {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);
        const user = authService.user;

        if (!user) {
            return router.parseUrl('/auth/login');
        }

        if (roles.length > 0 && (!user.role || !roles.includes(user.role))) {
            return router.parseUrl('/auth/access');
        }

        return true;
    };
};
