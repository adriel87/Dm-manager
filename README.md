# DM Manager

**English** | [Español](#español)

A web application for Dungeon Masters to document and manage tabletop RPG campaigns, including missions, characters (PCs and NPCs), and player groups — all in one organized place.

## Features

- **Campaigns** — create and track campaigns with status and session count
- **Missions** — organize missions within your campaigns
- **Characters** — manage Player Characters (PCs) and NPCs
- **Groups** — organize characters into player groups

## Tech Stack

- [Next.js 15](https://nextjs.org/) — App Router, API routes
- [MongoDB](https://www.mongodb.com/) — database
- [Zod](https://zod.dev/) — API input validation
- [Vitest](https://vitest.dev/) — unit testing
- Hexagonal Architecture (ports and adapters)

## Getting Started

### Prerequisites

- Node.js
- Docker (for MongoDB)

### Setup

```bash
# Install dependencies
npm install

# Start MongoDB
npm run dockerstart

# Start development server
npm run dev
```

### Environment Variables

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dungeon_master
MONGODB_USERNAME=dungeon_master
MONGODB_PASSWORD=dice_roller
```

## Commands

```bash
npm run dev           # Start dev server (runs lint first)
npm run dev:no-lint   # Start dev server without lint
npm run build         # Build for production
npm run dockerstart   # Start MongoDB via Docker
npm run generate      # Scaffold a new entity (interactive)
npm test              # Run tests in watch mode
npm run test:run      # Run tests once
npm run test:coverage # Run tests with coverage
npm run lint          # Lint
npm run lint:fix      # Lint and auto-fix
```

---

## Español

Una aplicación web para que un Dungeon Master pueda documentar y gestionar campañas de rol, incluyendo misiones, personajes (PCs y NPCs) y grupos de jugadores, todo de forma organizada.

## Funcionalidades

- **Campañas** — crea y gestiona campañas con estado y contador de sesiones
- **Misiones** — organiza misiones dentro de tus campañas
- **Personajes** — gestiona Personajes Jugadores (PCs) y NPCs
- **Grupos** — organiza personajes en grupos de jugadores

## Tecnologías

- [Next.js 15](https://nextjs.org/) — App Router, rutas API
- [MongoDB](https://www.mongodb.com/) — base de datos
- [Zod](https://zod.dev/) — validación de entrada en la API
- [Vitest](https://vitest.dev/) — pruebas unitarias
- Arquitectura Hexagonal (puertos y adaptadores)

## Inicio rápido

### Requisitos

- Node.js
- Docker (para MongoDB)

### Configuración

```bash
# Instalar dependencias
npm install

# Iniciar MongoDB
npm run dockerstart

# Iniciar servidor de desarrollo
npm run dev
```

### Variables de entorno

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dungeon_master
MONGODB_USERNAME=dungeon_master
MONGODB_PASSWORD=dice_roller
```

## Comandos

```bash
npm run dev           # Iniciar servidor dev (ejecuta lint primero)
npm run dev:no-lint   # Iniciar servidor dev sin lint
npm run build         # Compilar para producción
npm run dockerstart   # Iniciar MongoDB con Docker
npm run generate      # Crear scaffold de una nueva entidad (interactivo)
npm test              # Ejecutar tests en modo watch
npm run test:run      # Ejecutar tests una vez
npm run test:coverage # Ejecutar tests con cobertura
npm run lint          # Lint
npm run lint:fix      # Lint y auto-corrección
```
