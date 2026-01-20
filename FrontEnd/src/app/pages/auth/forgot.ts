import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../service/auth.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [ButtonModule, InputTextModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div class="w-full bg-surface-0 dark:bg-surface-900 py-14 px-8 sm:px-20" style="border-radius: 16px">
                    <div class="text-center mb-6">
                        <div class="text-surface-900 dark:text-surface-0 text-2xl font-medium mb-2">Recuperar acceso</div>
                        <span class="text-muted-color font-medium">Enviaremos un correo con instrucciones</span>
                    </div>

                    <div>
                        <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                        <input pInputText id="email" type="text" placeholder="Email" class="w-full md:w-120 mb-6" [(ngModel)]="email" />
                        <p-button label="Enviar" styleClass="w-full" (onClick)="submit()"></p-button>
                        <div class="mt-4 text-center">
                            <a routerLink="/auth/login" class="text-primary">Volver al login</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ForgotPassword {
    email = '';

    constructor(private authService: AuthService, private messageService: MessageService) {}

    submit() {
        this.authService.forgotPassword(this.email).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Recuperacion', detail: 'Email enviado (mock).' });
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Recuperacion', detail: 'No se pudo enviar.' });
            }
        });
    }
}
