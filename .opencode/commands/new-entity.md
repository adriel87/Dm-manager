---
description: Genera el scaffold hexagonal completo para una nueva entidad. Uso: /new-entity <NombreEntidad>
agent: build
---
Voy a crear el scaffold hexagonal completo para la entidad `$ARGUMENTS`.

Antes de escribir nada, confirma conmigo:
1. ¿Los campos que necesita la entidad y sus tipos?
2. ¿Es una entidad raíz (independiente) o depende de otra (ej: Session depende de Campaign)?

Una vez confirmado, crea los siguientes archivos siguiendo exactamente los patrones del proyecto:

**Domain** (`src/domain/$ARGUMENTS_lowercase/`):
- `$ARGUMENTS_lowercase.ts` — interfaz de la entidad + función de validación
- `$ARGUMENTS_lowercaseRepository.ts` — interfaz del repositorio (port)

**Application** (`src/application/useCases/$ARGUMENTS_lowercase/`):
- `$ARGUMENTS_lowercaseUseCases.ts` — getAll, getById, create, update, delete
  - Cada use case recibe el repositorio como primer argumento (nunca lo importa)

**Infrastructure**:
- `src/infrastructure/adapters/repositories/mongo/mongo$ARGUMENTS_pascal.Repository.ts` — implementación MongoDB
- `src/infrastructure/adapters/mappers/$ARGUMENTS_lowercase.mapper.ts` — documento MongoDB ↔ entidad de dominio
- `src/infrastructure/adapters/schemas/$ARGUMENTS_lowercase.schema.ts` — esquema Zod para validación de input

**API Routes**:
- `src/app/api/$ARGUMENTS_lowercase/route.ts` — GET list + POST
- `src/app/api/$ARGUMENTS_lowercase/[id]/route.ts` — GET by id + PUT + DELETE

**Tests**:
- `__test__/domain/$ARGUMENTS_lowercase.test.ts` — tests de validación de dominio
- `__test__/application/usaCases/$ARGUMENTS_lowercase/useCases.test.ts` — tests de use cases con vi.fn() mocks

Reglas críticas a respetar:
- IDs: siempre `ObjectId` en MongoDB, siempre `string id` en dominio — conversión solo en el mapper
- Use cases: reciben repositorio como primer parámetro, nunca importan implementaciones concretas
- Alias `@/*` → `src/*` en todos los imports, nunca rutas relativas entre capas
- Tests: `vi.fn()` para mocks, sin conexiones reales a DB
