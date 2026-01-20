# Frontend - Gestion de Seguros

## Descripcion
Aplicacion Angular con login, dashboard, administracion y gestion de clientes.
Menu dinamico por rol y consumo de APIs Node.

## Tecnologias
- Angular 20
- PrimeNG

## Requisitos
- API Node levantada en `http://localhost:3001`
- API .NET opcional para eventos

## Levantar el proyecto
```bash
npm install
ng serve
```
Abrir `http://localhost:4200/`.

## Rutas principales
- `/auth/login`
- `/welcome`
- `/dashboard` (admin)
- `/admin/users`
- `/admin/roles`
- `/admin/menus`
- `/admin/insurance-types`
- `/admin/services`
- `/clients`
- `/client-insurances`
- `/client-services`

## Notas
- Menu se carga desde BD segun rol.
- Toasts se muestran si la API no responde.

## Capturas sugeridas
- Login / Forgot Password
- Welcome con sesion e intentos fallidos
- Dashboard con metricas
- Administracion de usuarios y roles
- Tipos de seguro y servicios
- Gestion de clientes, polizas y servicios

Guarde las capturas en `FrontEnd/docs/screenshots/` con nombres descriptivos.
