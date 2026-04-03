# DM Manager

**English** | [Español](#español)

A web application for Dungeon Masters to document and manage tabletop RPG campaigns, including missions, characters (PCs and NPCs), and player groups — all in one organized place.

## Features

- **Campaigns** — create and track campaigns with status and session count
- **Missions** — organize missions within your campaigns
- **Characters** — manage Player Characters (PCs) and NPCs
- **Groups** — organize characters into player groups
- **Inventory** — track items and gold per campaign with money transfers
- **Notes** — attach notes to campaigns for quick reference
- **Play Mode** — live session management: characters, missions, notes, and recording in one view
- **Recording & Transcription** — record sessions and transcribe audio via Whisper (API or local)

## Tech Stack

- [Next.js 16](https://nextjs.org/) — App Router, API routes
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
# MongoDB (required)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dungeon_master
MONGODB_USERNAME=dungeon_master
MONGODB_PASSWORD=dice_roller

# Recording — Whisper API (default)
OPENAI_API_KEY=sk-...

# Recording — Local Whisper server (alternative)
# TRANSCRIPTION_PROVIDER=whisper-local
# WHISPER_LOCAL_URL=http://localhost:8080

# Recording storage path (optional, default: ./storage/recordings)
# RECORDINGS_STORAGE_PATH=./storage/recordings
```

#### Transcription providers

| Provider | How to activate | Requirement |
|----------|----------------|-------------|
| `whisper-api` (default) | set `OPENAI_API_KEY` | OpenAI account |
| `whisper-local` | set `TRANSCRIPTION_PROVIDER=whisper-local` + `WHISPER_LOCAL_URL` | A local server exposing `/v1/audio/transcriptions` (e.g. whisper.cpp, faster-whisper-server) |

The recordings directory is created automatically on first use.

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
- **Inventario** — gestiona objetos y oro por campaña con transferencias de dinero
- **Notas** — añade notas a cada campaña para consulta rápida
- **Modo Partida** — gestión en vivo de sesiones: personajes, misiones, notas y grabación en una sola vista
- **Grabación y Transcripción** — graba sesiones y transcribe el audio con Whisper (API o local)

## Tecnologías

- [Next.js 16](https://nextjs.org/) — App Router, rutas API
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
# MongoDB (obligatorio)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=dungeon_master
MONGODB_USERNAME=dungeon_master
MONGODB_PASSWORD=dice_roller

# Grabación — Whisper API (por defecto)
OPENAI_API_KEY=sk-...

# Grabación — Servidor Whisper local (alternativa)
# TRANSCRIPTION_PROVIDER=whisper-local
# WHISPER_LOCAL_URL=http://localhost:8080

# Ruta de almacenamiento de grabaciones (opcional, por defecto: ./storage/recordings)
# RECORDINGS_STORAGE_PATH=./storage/recordings
```

#### Proveedores de transcripción

| Proveedor | Cómo activarlo | Requisito |
|-----------|---------------|-----------|
| `whisper-api` (por defecto) | configurar `OPENAI_API_KEY` | Cuenta de OpenAI |
| `whisper-local` | configurar `TRANSCRIPTION_PROVIDER=whisper-local` + `WHISPER_LOCAL_URL` | Servidor local con `/v1/audio/transcriptions` (p.ej. whisper.cpp, faster-whisper-server) |

El directorio de grabaciones se crea automáticamente al guardar la primera grabación.

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
