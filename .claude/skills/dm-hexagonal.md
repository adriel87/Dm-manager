# dm-hexagonal

TRIGGER when: vas a crear o modificar cualquier capa backend del proyecto (domain, use cases, infrastructure, API routes).

## Capas y responsabilidades

```
src/domain/          → entidades + interfaces + validación pura
src/application/     → use cases (orquestan dominio y repositorio)
src/infrastructure/  → adaptadores: MongoDB, memory, mappers, Zod schemas
src/app/api/         → rutas Next.js (presentación de la API)
```

**Regla de oro**: dependencias siempre hacia adentro.
- `infrastructure` y `app/api` pueden importar de cualquier capa
- `application` solo importa de `domain`
- `domain` no importa de nadie

---

## 1. Domain entity — `src/domain/<entity>/<entity>.ts`

```typescript
export interface CampaignI {
  id: string;
  name: string;
  description: string;
  status: CampaignStatusType;
  sessions: number;
  nextSessionAt?: Date;
  lastSessionAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CampaignStatus {
  Activa = "Activa",
  Pausada = "Pausada",
  Finalizada = "Finalizada",
}
export type CampaignStatusType = keyof typeof CampaignStatus;

export class Campaign implements CampaignI {
  constructor(campaign: CampaignI) { /* asigna campos */ }
  updateCampaign(partial: Partial<CampaignI>) { /* muta + updatedAt = new Date() */ }
}

export const validateCampaign = (partial: Partial<CampaignI>) => {
  const errors: string[] = [];
  if (!partial.name || partial.name.length < 3)
    errors.push("El nombre no es válido, mínimo 3 caracteres");
  if (errors.length > 0) throw new Error(`Errores:\n${errors.join("\n")}`);
  return true;
};
```

## 2. Repository port — `src/domain/<entity>/<Entity>Repository.ts`

```typescript
import { CampaignI } from "./campaign";

export interface CampaignRepository {
  getAllCampaigns(): Promise<CampaignI[]>;
  getCampaignById(id: string): Promise<CampaignI | null>;
  createCampaign(campaign: Omit<CampaignI, "id">): Promise<CampaignI>;
  updateCampaign(campaign: CampaignI): Promise<CampaignI | null>;
  deleteCampaign(id: string): Promise<boolean>;
}
```

## 3. Use case — `src/application/useCases/<entity>/`

**El repositorio siempre llega como primer parámetro. Nunca se importa la implementación.**

```typescript
import { CampaignI, validateCampaign } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const createCampaign = async (
  repository: CampaignRepository,
  campaignData: Omit<CampaignI, "id">
): Promise<CampaignI> => {
  validateCampaign(campaignData);
  return repository.createCampaign({ ...campaignData, createdAt: new Date() });
};
```

Barrel export obligatorio en `index.ts`:
```typescript
export * from './createCampaign';
export * from './getCampaigns';
// ...
```

## 4. MongoDB repository — `src/infrastructure/adapters/repositories/mongo/<entity>.repository.ts`

```typescript
import { getCollection } from "@/infrastructure/config/mongodb";
import { ObjectId } from "mongodb";
import { campaignMappers } from "../../mappers/campaign.mapper";
import { MapperUtils } from "../../mappers/utils";

export const campaignRepository: CampaignRepository = {
  getAllCampaigns: async () => {
    const col = await getCollection('campaigns');
    return MapperUtils.fromDocumentListToEntityList(
      await col.find().toArray(),
      campaignMappers.fromMongoDocumentToEntity
    );
  },
  getCampaignById: async (id) => {
    const col = await getCollection('campaigns');
    const doc = await col.findOne({ _id: new ObjectId(id) });
    return doc ? MapperUtils.fromMongoDocumentToEntity(doc, campaignMappers.fromMongoDocumentToEntity) : null;
  },
  createCampaign: async (campaign) => {
    const col = await getCollection('campaigns');
    const result = await col.insertOne(campaign);
    return { ...campaign, id: result.insertedId.toString() };
  },
  updateCampaign: async (campaign) => {
    const col = await getCollection('campaigns');
    const result = await col.updateOne({ _id: new ObjectId(campaign.id) }, { $set: campaign });
    return result.modifiedCount > 0 ? campaign : null;
  },
  deleteCampaign: async (id) => {
    const col = await getCollection('campaigns');
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },
};
```

**`new ObjectId(id)` solo aquí. Nunca en use cases ni dominio.**

## 5. Memory repository — `src/infrastructure/adapters/repositories/memory/<entity>.repository.ts`

Siempre crea el equivalente en memory junto al MongoDB. Se activa con `REPOSITORY_TYPE=memory`.

```typescript
let store: CampaignI[] = [];
let nextId = 1;

export const campaignMemoryRepository: CampaignRepository = {
  getAllCampaigns: async () => [...store],
  getCampaignById: async (id) => store.find((c) => c.id === id) ?? null,
  createCampaign: async (campaign) => {
    const created = { ...campaign, id: String(nextId++) };
    store.push(created);
    return created;
  },
  updateCampaign: async (campaign) => {
    const i = store.findIndex((c) => c.id === campaign.id);
    if (i === -1) return null;
    store[i] = campaign;
    return campaign;
  },
  deleteCampaign: async (id) => {
    const i = store.findIndex((c) => c.id === id);
    if (i === -1) return false;
    store.splice(i, 1);
    return true;
  },
};

export const resetCampaignStore = () => { store = []; nextId = 1; };
```

## 6. Mapper — `src/infrastructure/adapters/mappers/<entity>.mapper.ts`

Conversión `_id (ObjectId) → id (string)` **solo aquí**.

```typescript
export const campaignMappers = {
  fromMongoDocumentToEntity: (doc: Document | WithId<Document>): CampaignI => ({
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    status: doc.status,
    sessions: doc.sessions,
    createdAt: new Date(doc.createdAt),
    lastSessionAt: doc.lastSessionAt ? new Date(doc.lastSessionAt) : undefined,
    nextSessionAt: doc.nextSessionAt ? new Date(doc.nextSessionAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }),
};
```

## 7. Zod schema — `src/infrastructure/adapters/schemas/<entity>.schema.ts`

Solo valida el input de la API. No replica la validación de dominio.

```typescript
import { CampaignStatus } from "@/domain/campaign/campaign";
import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(Object.values(CampaignStatus) as [string, ...string[]]).default(CampaignStatus.Activa),
  sessions: z.number().default(0),
  nextSessionAt: z.coerce.date().optional(),
});
```

## 8. API Routes

```typescript
// route.ts — GET list + POST
export async function GET() {
  const items = await getAll(repositories.entity);
  return NextResponse.json(items);
}
export async function POST(req: NextRequest) {
  const body = entitySchema.parse(await req.json());
  const created = await create(repositories.entity, body);
  return NextResponse.json(created, { status: 201 });
}

// [id]/route.ts — GET + PUT + DELETE
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getById(repositories.entity, id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}
```

## 9. Registrar en repositories.ts

```typescript
import { entityRepository } from "@/infrastructure/adapters/repositories/mongo/entity.repository";
import { entityMemoryRepository } from "@/infrastructure/adapters/repositories/memory/entity.repository";

export const repositories = {
  // ...existentes
  entity: useMemory ? entityMemoryRepository : entityRepository,
};
```

## Checklist

- [ ] `domain/<entity>.ts` — interface + clase + validateFn
- [ ] `domain/<entity>Repository.ts` — interface del port
- [ ] `application/useCases/<entity>/` — un archivo por use case + `index.ts`
- [ ] `infrastructure/.../mongo/<entity>.repository.ts`
- [ ] `infrastructure/.../memory/<entity>.repository.ts` + resetStore
- [ ] `infrastructure/.../mappers/<entity>.mapper.ts`
- [ ] `infrastructure/.../schemas/<entity>.schema.ts`
- [ ] `app/api/<entity>/route.ts` + `[id]/route.ts`
- [ ] `infrastructure/config/repositories.ts` — registrado
- [ ] `__test__/application/usaCases/<entity>/useCases.test.ts`
