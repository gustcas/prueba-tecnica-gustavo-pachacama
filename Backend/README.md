# Backend - Gestion de Seguros

## Descripcion
Backend con dos microservicios:
1) API de gestion (Node.js + PostgreSQL) con DDD, Outbox y resiliencia.
2) API de eventos (ASP.NET Core + MongoDB) para registro de eventos.

## Tecnologias y versiones
- Node.js v20.19.1
- PostgreSQL 17
- TypeORM 0.3.x
- .NET 8
- MongoDB 6
- Docker Compose

## Estructura
- api-management-node/
- api-events-dotnet/
- docker-compose.yml
- scripts/

## Levantar infraestructura
Desde `Backend/`:
```bash
docker-compose up -d
```

## API Node (gestion)
Desde `Backend/api-management-node/`:
```bash
npm install
npm run dev
```

### Variables de entorno
Crear `.env` con base en `.env.example`:
```
PORT=3001
JWT_SECRET=dev_secret
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=insurance_management
EVENTS_API_BASE_URL=http://localhost:5001
OUTBOX_POLL_MS=5000
```

### Seed de roles y menus
```bash
npm run seed
```

### Swagger
http://localhost:3001/api/docs

## API .NET (eventos)
Desde `Backend/api-events-dotnet/`:
```bash
dotnet restore
dotnet run
```

### Configuracion Mongo
`appsettings.json`:
```
Mongo: ConnectionString, Database, Collection
```

### Swagger
http://localhost:5001/swagger

## Scripts SQL
- `scripts/fn_next_available_username.sql`

## Outbox y resiliencia
- Eventos se escriben en `outbox_events` dentro de la misma transaccion.
- Worker reintenta con backoff cuando la API .NET no esta disponible.

## Reglas clave
- Login con email o systemUsername.
- 1 sesion activa por usuario.
- 3 intentos fallidos bloquean usuario.
- Username y password con reglas estrictas.
- Validacion de cedula ecuatoriana.
- Cliente empresa no puede tener 2 seguros del mismo tipo.
- Polizas soportan reactivacion si existio historial cancelado.

## Capturas sugeridas
- Swagger Node
- Swagger .NET
- Outbox en retry cuando .NET esta caido

Guarde las capturas en `Backend/docs/screenshots/` con nombres descriptivos.
