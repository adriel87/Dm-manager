---
name: dm-heroui
description: >
  Componentes HeroUI y patrones UI específicos de DM Manager: paleta de colores,
  constantes de estilos compartidas, estructura de modales, Cards, Chips, inputs
  accesibles y el patrón Server Component / Client Component island del proyecto.
  Trigger: cuando vayas a crear o modificar componentes de UI, páginas o estilos.
---

## Paleta y tokens de color del proyecto

```
Superficies:    zinc-900 (fondo app)  zinc-800 (cards, inputs)  zinc-700 (borders hover)
Texto:          white (primario)  zinc-400 (secundario)  zinc-500 (deshabilitado/meta)
Acento:         primary-500 / primary-600 (botones, tabs activos, focus ring)
Borders:        zinc-700 (normal)  zinc-600 (hover)  zinc-500 (hover fuerte)
```

Colores semánticos del dominio (mapean a colores HeroUI):
```typescript
// src/constants/ui.ts
STATUS_COLOR  = { Activa: 'success', Pausada: 'warning', Finalizada: 'default' }
PRIORITY_COLOR = { Alta: 'danger',   Media: 'warning',   Baja: 'default' }
```

---

## Constantes de estilos compartidas — SIEMPRE úsalas, nunca inline

```typescript
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';

// INPUT_CLASSES → classNames para <Input> y <Textarea>
const INPUT_CLASSES = {
  label: 'text-zinc-300',
  input: 'text-white',
  inputWrapper: 'bg-zinc-800 border-zinc-600 hover:border-zinc-500',
};

// MODAL_CLASSES → classNames para <Modal>
const MODAL_CLASSES = {
  base: 'bg-zinc-900 border border-zinc-700',
  header: 'border-b border-zinc-700',
  footer: 'border-t border-zinc-700',
};

// ERROR_CLASSES → className para <p role="alert">
const ERROR_CLASSES = 'text-danger-400 text-sm bg-danger-50/10 border border-danger-200/20 rounded-lg px-3 py-2';

// SELECT_CLASSES → classNames para <Select> y <SelectItem>
```

---

## Componentes HeroUI usados en el proyecto

| Componente | Import | Uso típico |
|-----------|--------|-----------|
| `Card, CardHeader, CardBody, CardFooter` | `@heroui/react` | Tarjetas de entidades |
| `Chip` | `@heroui/react` | Badges de estado/prioridad/tipo |
| `Button` | `@heroui/react` | Acciones — siempre `aria-label` |
| `Modal, ModalContent, ModalHeader, ModalBody, ModalFooter` | `@heroui/react` | Formularios de creación/edición |
| `Input, Textarea` | `@heroui/react` | Campos de formulario |
| `Select, SelectItem` | `@heroui/react` | Selects de enum (status, classType, age) |
| `Switch` | `@heroui/react` | Toggle booleano (isNPC) |
| `Tabs, Tab` | `@heroui/react` | Navegación por secciones (CampaignTabs) |
| `ButtonGroup` | `@heroui/react` | Filtros PC/NPC |
| `useDisclosure` | `@heroui/react` | Estado open/close de modales |

---

## Patrón Card — entidad con estado y acciones

```tsx
// Patrón real: MissionItem.tsx / CharacterCard.tsx / CampaignCard.tsx

import { Card, CardBody, CardHeader, CardFooter, Chip } from '@heroui/react';
import { STATUS_COLOR } from '@/constants/ui';

export function EntityCard({ entity }: { entity: EntityI }) {
  const statusColor = STATUS_COLOR[entity.status] ?? STATUS_COLOR['Finalizada'];

  return (
    <Card
      className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors duration-200"
      shadow="none"
    >
      <CardHeader className="flex items-start justify-between gap-3 pb-2">
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1 flex-1">
          {entity.name}
        </h3>
        <Chip size="sm" color={statusColor} variant="flat" className="text-xs shrink-0">
          {entity.status}
        </Chip>
      </CardHeader>

      <CardBody className="py-2">
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">
          {entity.description || 'Sin descripción.'}
        </p>
      </CardBody>

      <CardFooter className="flex items-center gap-4 pt-3 border-t border-zinc-700">
        {/* meta info — texto xs, zinc-500 */}
      </CardFooter>
    </Card>
  );
}
```

Card clickable (navegación a detalle):
```tsx
import Link from 'next/link';

<Link
  href={`/entities/${entity.id}`}
  className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl"
  aria-label={`Abrir entidad: ${entity.name}`}   // ← necesario para Playwright
>
  <Card className="... group-hover:border-zinc-500 ...">
    {/* contenido */}
  </Card>
</Link>
```

---

## Patrón Modal de creación — estructura completa del proyecto

```tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  Input, Textarea, Select, SelectItem, useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';
import { apiPost } from '@/lib/api';

interface FormState { name: string; /* ...campos */ }
const EMPTY_FORM: FormState = { name: '' };

export function CreateEntityButton() {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClose() { setForm(EMPTY_FORM); setError(null); onClose(); }
  function setField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);      // limpiar error al escribir
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    startTransition(async () => {
      const { error: apiError } = await apiPost('/api/entity', form);
      if (apiError) { setError(apiError); return; }
      router.refresh();    // refresca Server Components del padre
      handleClose();
    });
  }

  return (
    <>
      {/* Trigger */}
      <Button onPress={onOpen} color="primary" variant="solid"
              className="font-medium" aria-label="Crear nueva entidad">
        + Nueva entidad
      </Button>

      {/* Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleClose}
             placement="center" size="lg" scrollBehavior="inside" classNames={MODAL_CLASSES}>
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Nueva entidad
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Input
                  label="Nombre"
                  placeholder="Nombre de la entidad"
                  value={form.name}
                  onValueChange={(val) => setField('name', val)}
                  isRequired isDisabled={isPending} autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Nombre de la entidad"   // ← siempre aria-label en HeroUI
                />

                {/* Select de enum */}
                <Select
                  label="Estado"
                  selectedKeys={[form.status]}
                  onSelectionChange={(keys) => {
                    const val = Array.from(keys)[0] as StatusType;
                    if (val) setField('status', val);
                  }}
                  isDisabled={isPending} classNames={SELECT_CLASSES}
                  aria-label="Estado de la entidad"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>

                {/* Error — siempre role="alert" */}
                {error && <p role="alert" className={ERROR_CLASSES}>{error}</p>}
              </ModalBody>

              <ModalFooter className="gap-2">
                <Button type="button" variant="flat" color="default"
                        onPress={handleClose} isDisabled={isPending}
                        className="text-zinc-300">
                  Cancelar
                </Button>
                <Button type="submit" color="primary"
                        isLoading={isPending} isDisabled={isPending}
                        className="font-medium">
                  {isPending ? 'Creando...' : 'Crear entidad'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
```

---

## Patrón Server Component + Client island

```tsx
// src/app/entities/page.tsx — Server Component (no 'use client')
import { fetchApi } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader';
import { EntityFilters } from '@/components/entities/EntityFilters'; // Client island
import { CreateEntityButton } from '@/components/entities/CreateEntityButton'; // Client island

export default async function EntitiesPage() {
  const entities = (await fetchApi<EntityI[]>('/api/entity')) ?? [];

  return (
    <section aria-labelledby="entities-heading">
      <PageHeader
        title="Entidades"
        subtitle={`${entities.length} ${entities.length === 1 ? 'entidad' : 'entidades'}`}
        action={<CreateEntityButton />}
      />
      {/* Pasa datos al island — sin fetch adicional */}
      <EntityFilters entities={entities} />
    </section>
  );
}
```

```tsx
// src/components/entities/EntityFilters.tsx — Client island
'use client';
import { useState } from 'react';
import { Button, ButtonGroup } from '@heroui/react';
import { EntityCard } from './EntityCard';

export function EntityFilters({ entities }: { entities: EntityI[] }) {
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  const filtered = filter === 'all' ? entities : entities.filter(e => e.status === 'Activa');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3" role="group" aria-label="Filtrar entidades">
        <ButtonGroup size="sm" variant="flat">
          {['all', 'active'].map(key => (
            <Button
              key={key}
              onPress={() => setFilter(key as 'all' | 'active')}
              aria-pressed={filter === key}
              className={filter === key
                ? 'bg-primary-600 text-white font-medium'
                : 'bg-zinc-800 text-zinc-400 hover:text-white border-zinc-700'}
            >
              {key === 'all' ? 'Todas' : 'Activas'}
            </Button>
          ))}
        </ButtonGroup>
        <span className="text-zinc-500 text-sm" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'entidad' : 'entidades'}
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          role="list" aria-label="Lista de entidades">
        {filtered.map(e => (
          <li key={e.id}><EntityCard entity={e} /></li>
        ))}
      </ul>
    </div>
  );
}
```

---

## PageHeader — componente de cabecera estándar

```tsx
// Siempre usa este componente para el h1 de cada página
import { PageHeader } from '@/components/ui/PageHeader';

<PageHeader
  title="Nombre de la sección"
  subtitle="Texto descriptivo o conteo"
  action={<CreateEntityButton />}   // opcional — botón de acción en la cabecera
/>
```

---

## EmptyState — estado vacío estándar

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  emoji="🎲"
  title="Sin entidades todavía"
  message='Pulsa "+ Nueva entidad" para crear la primera.'
/>
```

---

## Reglas de accesibilidad del proyecto

| Elemento | Regla |
|---------|-------|
| Botones de acción | Siempre `aria-label` descriptivo |
| Inputs HeroUI | Siempre `aria-label` (no `<label>` HTML — Playwright lo usa así) |
| Links de navegación | `aria-label="Abrir X: {nombre}"` para locator en E2E |
| Listas de items | `role="list"` + `aria-label="Lista de X"` |
| Errores de formulario | `<p role="alert" className={ERROR_CLASSES}>` |
| Filtros de botones | `role="group"` + `aria-label` en el wrapper |
| Contador de filtro | `aria-live="polite"` en el span del conteo |
| Secciones de página | `aria-labelledby` apuntando al `id` del heading |
