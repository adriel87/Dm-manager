---
name: dm-hexagonal
description: >
  Patrones exactos de la arquitectura hexagonal de DM Manager: cómo crear cada
  archivo de cada capa (domain, use cases, mongo repository, memory repository,
  mapper, Zod schema, API route) con código real del proyecto como referencia.
  Trigger: cuando vayas a crear o modificar cualquier capa backend del proyecto.
---

## Capas y sus responsabilidades

```
src/domain/          → entidades + interfaces + validación pura
src/application/     → use cases (orquestan dominio y repositorio)
src/infrastructure/  → adaptadores: MongoDB, memory, mappers, Zod schemas
src/app/api/         → rutas Next.js (presentación de la API)
```

**Regla de oro**: las dependencias apuntan siempre hacia adentro.
`infrastructure` y `app/api` pueden importar de cualquier capa.
`application` solo importa de `domain`.
`domain` no importa de nadie.

---

## 1. Domain entity — `src/domain/<entity>/<entity>.ts`

Patrón: **interface + clase + función de validación**. Sin imports de otras capas.

```typescript
// Ejemplo real: src/domain/campaign/campaign.ts

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
  // ...campos
  constructor(campaign: CampaignI) { /* asigna campos */ }
  updateCampaign(partial: Partial<CampaignI>) { /* muta + updatedAt = new Date() */ }
}

export const validateCampaign = (partial: Partial<CampaignI>) => {
  const errors: string[] = [];
  if (!partial.name || partial.name.length < 3)
    errors.push("El nombre no es válido, mínimo 3 caracteres");
  // ...más validaciones
  if (errors.length > 0) throw new Error(`Errores:\n${errors.join("\n")}`);
  return true;
};
```

---

## 2. Repository port — `src/domain/<entity>/<Entity>Repository.ts`

Interface pura. No implementa nada.

```typescript
// Ejemplo real: src/domain/campaign/CampaignRepository.ts

import { CampaignI } from "./campaign";

export interface CampaignRepository {
  getAllCampaigns(): Promise<CampaignI[]>;
  getCampaignById(id: string): Promise<CampaignI | null>;
  createCampaign(campaign: Omit<CampaignI, "id">): Promise<CampaignI>;
  updateCampaign(campaign: CampaignI): Promise<CampaignI | null>;
  deleteCampaign(id: string): Promise<boolean>;
}
```

---

## 3. Use case — `src/application/useCases/<entity>/create<Entity>.ts`

**El repositorio siempre llega como primer parámetro. Nunca se importa la implementación.**

```typescript
// Ejemplo real: src/application/useCases/campaign/createCampaign.ts

import { CampaignI, validateCampaign } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

export const createCampaign = async (
  repository: CampaignRepository,
  campaignData: Omit<CampaignI, "id">
): Promise<CampaignI> => {
  try {
    validateCampaign(campaignData);           // dominio primero
    const newCampaign = await repository.createCampaign({
      ...campaignData,
      createdAt: new Date(),
    });
    return newCampaign;
  } catch (e) {
    console.error(e);
    throw new Error("Failed to create campaign");
  }
};
```

Barrel export obligatorio en `index.ts`:
```typescript
export * from './createCampaign';
export * from './getCampaigns';
export * from './getCampaignById';
export * from './updateCampaign';
export * from './deleteCampaign';
```

---

## 4. MongoDB repository — `src/infrastructure/adapters/repositories/mongo/<entity>.repository.ts`

```typescript
// Ejemplo real: src/infrastructure/adapters/repositories/mongo/campaign.repository.ts

import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";
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

  getCampaignById: async (id: string) => {
    const col = await getCollection('campaigns');
    const doc = await col.findOne({ _id: new ObjectId(id) });
    return doc
      ? MapperUtils.fromMongoDocumentToEntity(doc, campaignMappers.fromMongoDocumentToEntity)
      : null;
  },

  createCampaign: async (campaign) => {
    const col = await getCollection('campaigns');
    const result = await col.insertOne(campaign);
    return { ...campaign, id: result.insertedId.toString() };
  },

  updateCampaign: async (campaign) => {
    const col = await getCollection('campaigns');
    const result = await col.updateOne(
      { _id: new ObjectId(campaign.id) },
      { $set: campaign }
    );
    return result.modifiedCount > 0 ? campaign : null;
  },

  deleteCampaign: async (id: string) => {
    const col = await getCollection('campaigns');
    const result = await col.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },
};
```

**Regla crítica**: `new ObjectId(id)` solo en el repositorio MongoDB. Nunca en use cases ni dominio.

---

## 5. Memory repository — `src/infrastructure/adapters/repositories/memory/<entity>.repository.ts`

Siempre que crees un repositorio MongoDB, crea también su equivalente en memory.
Se activa con `REPOSITORY_TYPE=memory` (útil para tests de integración).

```typescript
// Ejemplo real: src/infrastructure/adapters/repositories/memory/campaign.repository.ts

import { CampaignI } from "@/domain/campaign/campaign";
import { CampaignRepository } from "@/domain/campaign/CampaignRepository";

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

// Expón siempre un reset para tests
export const resetCampaignStore = () => { store = []; nextId = 1; };
```

---

## 6. Mapper — `src/infrastructure/adapters/mappers/<entity>.mapper.ts`

La conversión `_id (ObjectId) → id (string)` ocurre **solo aquí**.

```typescript
// Ejemplo real: src/infrastructure/adapters/mappers/campaign.mapper.ts

import { CampaignI } from "@/domain/campaign/campaign";
import { Document, WithId } from "mongodb";

export const campaignMappers = {
  fromMongoDocumentToEntity: (doc: Document | WithId<Document>): CampaignI => {
    if (!doc) throw new Error("Document is null or undefined");
    return {
      id: doc._id.toString(),          // ← conversión aquí y solo aquí
      name: doc.name,
      description: doc.description,
      status: doc.status,
      sessions: doc.sessions,
      createdAt: new Date(doc.createdAt),
      lastSessionAt: doc.lastSessionAt ? new Date(doc.lastSessionAt) : undefined,
      nextSessionAt: doc.nextSessionAt ? new Date(doc.nextSessionAt) : undefined,
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
    };
  },
};
```

---

## 7. Zod schema — `src/infrastructure/adapters/schemas/<entity>.schema.ts`

Solo valida el **input de la API**. No replica la validación de dominio.

```typescript
// Ejemplo real: src/infrastructure/adapters/schemas/campaign.schema.ts

import { CampaignStatus } from "@/domain/campaign/campaign";
import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  status: z.enum(Object.values(CampaignStatus) as [string, ...string[]])
           .default(CampaignStatus.Activa),
  sessions: z.number().default(0),
  // campos opcionales:
  nextSessionAt: z.coerce.date().optional(),
  lastSessionAt: z.coerce.date().optional(),
});

export type CampaignSchema = z.infer<typeof campaignSchema>;
```

---

## 8. API Routes — `src/app/api/<entity>/route.ts` y `[id]/route.ts`

```typescript
// GET list + POST — src/app/api/campaign/route.ts

import { getCampaigns, createCampaign } from '@/application/useCases/campaign';
import { repositories } from '@/infrastructure/config/repositories';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const campaigns = await getCampaigns(repositories.campaign);
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = campaignSchema.parse(body);
  const created = await createCampaign(repositories.campaign, validated);
  if (!created) return NextResponse.json({ error: 'Failed' }, { status: 400 });
  return NextResponse.json(created, { status: 201 });
}
```

```typescript
// GET by id + PUT + DELETE — src/app/api/campaign/[id]/route.ts

import { getCampaignById, updateCampaign } from '@/application/useCases/campaign';
import { repositories } from '@/infrastructure/config/repositories';
import { campaignSchema } from '@/infrastructure/adapters/schemas/campaign.schema';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaignById(repositories.campaign, id);
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(campaign);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = campaignSchema.parse(await req.json());
  const updated = await updateCampaign(repositories.campaign, { ...body, id });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deleted = await repositories.campaign.deleteCampaign(id);
  return NextResponse.json({ message: deleted ? 'Deleted' : 'Failed' });
}
```

---

## 9. Registrar el repositorio — `src/infrastructure/config/repositories.ts`

Añade la nueva entidad al objeto `repositories`:

```typescript
import { entityRepository } from "@/infrastructure/adapters/repositories/mongo/entity.repository";
import { entityMemoryRepository } from "@/infrastructure/adapters/repositories/memory/entity.repository";

export const repositories = {
  // ...existentes
  entity: useMemory ? entityMemoryRepository : entityRepository,
};
```

---

## Checklist antes de dar una tarea por completada

- [ ] `domain/<entity>.ts` — interface + clase + validateFn
- [ ] `domain/<entity>Repository.ts` — interface del port
- [ ] `application/useCases/<entity>/` — un archivo por use case + `index.ts`
- [ ] `infrastructure/.../mongo/<entity>.repository.ts` — ObjectId solo aquí
- [ ] `infrastructure/.../memory/<entity>.repository.ts` — con `reset<Entity>Store()`
- [ ] `infrastructure/.../mappers/<entity>.mapper.ts` — conversión `_id → id`
- [ ] `infrastructure/.../schemas/<entity>.schema.ts` — Zod schema de input
- [ ] `app/api/<entity>/route.ts` + `[id]/route.ts`
- [ ] `infrastructure/config/repositories.ts` — registrado
- [ ] Tests: `__test__/application/usaCases/<entity>/useCases.test.ts`
