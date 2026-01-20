# Prueba Tecnica - Gestion de Seguros (Microservicios)

## Descripcion
Solucion full-stack con microservicios:
- API de gestion (Node.js + PostgreSQL) con DDD, Outbox y resiliencia.
- API de eventos (ASP.NET Core + MongoDB) para registro de eventos.
- Frontend Angular con menu dinamico por rol.

## Tecnologias y versiones
- Node.js v20.19.1
- PostgreSQL 17
- TypeORM 0.3.x
- .NET 8 (ASP.NET Core)
- MongoDB 6
- Angular 20

## Estructura
- Backend/
  - api-management-node
  - api-events-dotnet
  - docker-compose.yml
  - scripts/
- FrontEnd/

## Levantar el entorno (resumen)
1) Base de datos:
   - `cd Backend`
   - `docker-compose up -d`

2) API Node (gestion):
   - `cd Backend/api-management-node`
   - `npm install`
   - `npm run dev`
   - `npm run seed`

3) API .NET (eventos):
   - `cd Backend/api-events-dotnet`
   - `dotnet restore`
   - `dotnet run`

4) Frontend:
   - `cd FrontEnd`
   - `npm install`
   - `ng serve`

## Swagger
- Node: http://localhost:3001/api/docs
- .NET: http://localhost:5001/swagger

## Variables de entorno
Ver `Backend/api-management-node/.env.example`.

## Data inicial
Ejecuta `npm run seed` en `Backend/api-management-node` para crear roles, menus, usuarios, clientes y polizas de ejemplo.

## Capturas sugeridas
- Login
- Welcome (datos usuario + ultima sesion)
- Dashboard admin (metricas)
- Admin usuarios, roles, menus
- Admin tipos de seguro y servicios
- Gestion de clientes, polizas y servicios

Guarde las capturas en `docs/screenshots/` en la raiz.

## Decisiones clave
- systemUsername vs loginUser documentado en Backend README.
- Outbox para resiliencia (Node no cae si .NET esta fuera).
- Soft delete y transacciones en operaciones criticas.
