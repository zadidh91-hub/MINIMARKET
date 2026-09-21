# Minimarket Andes

Sistema académico de gestión de minimarket: **monolito modular** con **arquitectura hexagonal** (puertos y adaptadores) y principios **SOLID**.

No usa Docker, microservicios, CQRS ni Event Sourcing.

## Requisitos

- Node.js 20+
- PostgreSQL local (sin contenedores)

## Arranque

### 1. Base de datos

Crea la base en PostgreSQL:

```sql
CREATE DATABASE minimarket;
```

### 2. Backend

```bash
cd backend
copy .env.example .env
```

Ajusta `DATABASE_URL` en `backend/.env` con tu usuario y contraseña de PostgreSQL.

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run test
npm run dev
```

API: `http://localhost:3001`

### 3. Frontend

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

UI: `http://localhost:5173`

## Credenciales de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| ADMIN | admin@minimarket.com | admin123 |
| VENDEDOR | vendedor@minimarket.com | vendedor123 |

## Arquitectura del backend

Cada módulo de negocio (`products`, `categories`, `inventory`, `sales`, `customers`, `users`, `auth`) se organiza así:

- **Dominio**: entidades y puertos (interfaces). No importa Express ni Prisma.
- **Aplicación**: casos de uso. Dependen de puertos, no de PostgreSQL.
- **Adaptadores de entrada**: rutas HTTP delgadas.
- **Adaptadores de salida**: Prisma, JWT, bcrypt, archivos locales.

El composition root está en `backend/src/infrastructure/composition.ts`. Ahí se cablean implementaciones concretas.

La venta se registra en una **transacción Prisma**: valida productos, calcula importes en el servidor, graba cabecera/detalle, descuenta stock y crea movimientos. Si falla una parte crítica, se revierte todo.

Las imágenes de producto se guardan en `backend/uploads/products/`. PostgreSQL solo almacena la ruta.

## Roles

- **ADMIN**: catálogo, inventario, usuarios y ventas.
- **VENDEDOR**: ventas, consulta de productos/clientes/inventario. No crea productos ni usuarios.

## Pruebas

Las pruebas unitarias usan repositorios en memoria. Cubren cálculo de totales, stock insuficiente y búsqueda de productos.
