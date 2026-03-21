# new-entity

TRIGGER when: el usuario quiere crear una nueva entidad del dominio con su scaffold hexagonal completo.

## Job

Generar todos los archivos del scaffold hexagonal para una nueva entidad, siguiendo exactamente los patrones del proyecto.

## Antes de escribir nada — confirma con el usuario

1. ¿Qué campos necesita la entidad y cuáles son sus tipos TypeScript?
2. ¿Es una entidad raíz (independiente) o depende de otra? Ej: Session depende de Campaign.
3. ¿Qué validaciones de dominio debe tener? (campos obligatorios, longitudes mínimas, enums)

## Archivos a generar (en este orden)

### 1. Domain
- `src/domain/<entity>/<entity>.ts` — interface + clase + validateFn
- `src/domain/<entity>/<Entity>Repository.ts` — interface del port (métodos: getAll, getById, create, update, delete)

### 2. Application
- `src/application/useCases/<entity>/get<Entity>s.ts`
- `src/application/useCases/<entity>/get<Entity>ById.ts`
- `src/application/useCases/<entity>/create<Entity>.ts`
- `src/application/useCases/<entity>/update<Entity>.ts`
- `src/application/useCases/<entity>/delete<Entity>.ts`
- `src/application/useCases/<entity>/index.ts` — barrel export

### 3. Infrastructure
- `src/infrastructure/adapters/repositories/mongo/<entity>.repository.ts`
- `src/infrastructure/adapters/repositories/memory/<entity>.repository.ts` + `reset<Entity>Store()`
- `src/infrastructure/adapters/mappers/<entity>.mapper.ts`
- `src/infrastructure/adapters/schemas/<entity>.schema.ts`

### 4. API Routes
- `src/app/api/<entity>/route.ts` — GET list + POST (201)
- `src/app/api/<entity>/[id]/route.ts` — GET + PUT + DELETE

### 5. Tests
- `__test__/domain/<entity>.test.ts` — tests de validateFn
- `__test__/application/usaCases/<entity>/useCases.test.ts` — tests con vi.fn() mocks

### 6. Registro
- Actualizar `src/infrastructure/config/repositories.ts` con la nueva entidad

## Reglas críticas (nunca violar)

- `id` siempre `string` en dominio — `ObjectId` solo en el repositorio MongoDB, conversión solo en el mapper
- Use cases reciben repositorio como primer parámetro, **nunca** importan implementaciones concretas
- Imports siempre con `@/*`, nunca rutas relativas entre capas
- Tests: `vi.fn()` para mocks, sin conexiones reales a DB, `beforeEach(() => vi.clearAllMocks())`
- POST en API route devuelve `status: 201`

## Referencia de patrones

Ver `.claude/skills/dm-hexagonal.md` para código de ejemplo real de cada capa.
