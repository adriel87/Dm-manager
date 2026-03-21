# dm-heroui

TRIGGER when: vas a crear o modificar componentes de UI, páginas o estilos.

## Paleta de colores del proyecto

```
Superficies:  zinc-900 (fondo app) · zinc-800 (cards, inputs) · zinc-700 (borders hover)
Texto:        white (primario) · zinc-400 (secundario) · zinc-500 (deshabilitado)
Acento:       primary-500 / primary-600 (botones, tabs activos, focus ring)
```

Colores semánticos (en `src/constants/ui.ts`):
```typescript
STATUS_COLOR   = { Activa: 'success', Pausada: 'warning', Finalizada: 'default' }
PRIORITY_COLOR = { Alta: 'danger',   Media: 'warning',   Baja: 'default' }
```

## Constantes de estilo — SIEMPRE úsalas, nunca repitas clases inline

```typescript
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';
```

## Componentes HeroUI usados en el proyecto

| Componente | Uso |
|-----------|-----|
| `Card, CardHeader, CardBody, CardFooter` | Tarjetas de entidades |
| `Chip` | Badges de estado/prioridad |
| `Button` | Acciones — siempre `aria-label` |
| `Modal, ModalContent, ModalHeader, ModalBody, ModalFooter` | Formularios |
| `Input, Textarea` | Campos — siempre `aria-label` |
| `Select, SelectItem` | Selects de enum |
| `Switch` | Toggle booleano |
| `Tabs, Tab` | Navegación por secciones |
| `useDisclosure` | Estado open/close de modales |

## Patrón Card

```tsx
import { Card, CardBody, CardHeader, CardFooter, Chip } from '@heroui/react';
import { STATUS_COLOR } from '@/constants/ui';

export function EntityCard({ entity }: { entity: EntityI }) {
  return (
    <Card className="bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-colors duration-200" shadow="none">
      <CardHeader className="flex items-start justify-between gap-3 pb-2">
        <h3 className="text-white font-semibold text-sm line-clamp-1 flex-1">{entity.name}</h3>
        <Chip size="sm" color={STATUS_COLOR[entity.status]} variant="flat" className="text-xs shrink-0">
          {entity.status}
        </Chip>
      </CardHeader>
      <CardBody className="py-2">
        <p className="text-zinc-400 text-sm line-clamp-2">{entity.description || 'Sin descripción.'}</p>
      </CardBody>
      <CardFooter className="pt-3 border-t border-zinc-700">
        {/* meta info — texto xs, zinc-500 */}
      </CardFooter>
    </Card>
  );
}
```

Card con link de navegación:
```tsx
<Link href={`/entities/${entity.id}`} aria-label={`Abrir entidad: ${entity.name}`}
      className="block group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xl">
  <Card className="... group-hover:border-zinc-500 ...">...</Card>
</Link>
```

## Patrón Modal de creación

```tsx
'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, useDisclosure } from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES } from '@/constants/ui';
import { apiPost } from '@/lib/api';

interface FormState { name: string }
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
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    startTransition(async () => {
      const { error: apiError } = await apiPost('/api/entity', form);
      if (apiError) { setError(apiError); return; }
      router.refresh();
      handleClose();
    });
  }

  return (
    <>
      <Button onPress={onOpen} color="primary" className="font-medium" aria-label="Crear nueva entidad">
        + Nueva entidad
      </Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleClose}
             placement="center" size="lg" classNames={MODAL_CLASSES}>
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">Nueva entidad</ModalHeader>
              <ModalBody className="gap-4 py-5">
                <Input label="Nombre" value={form.name}
                       onValueChange={(val) => setField('name', val)}
                       isRequired isDisabled={isPending} autoFocus
                       classNames={INPUT_CLASSES} aria-label="Nombre de la entidad" />
                {error && <p role="alert" className={ERROR_CLASSES}>{error}</p>}
              </ModalBody>
              <ModalFooter className="gap-2">
                <Button type="button" variant="flat" onPress={handleClose}
                        isDisabled={isPending} className="text-zinc-300">Cancelar</Button>
                <Button type="submit" color="primary" isLoading={isPending} className="font-medium">
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

## Patrón Server Component + Client island

```tsx
// page.tsx — Server Component, sin 'use client'
export default async function EntitiesPage() {
  const entities = (await fetchApi<EntityI[]>('/api/entity')) ?? [];
  return (
    <section aria-labelledby="entities-heading">
      <PageHeader title="Entidades" subtitle={`${entities.length} entidades`} action={<CreateEntityButton />} />
      <EntityFilters entities={entities} />
    </section>
  );
}

// EntityFilters.tsx — Client island
'use client';
export function EntityFilters({ entities }: { entities: EntityI[] }) {
  const [filter, setFilter] = useState<'all' | 'active'>('all');
  // ...
  return (
    <ul role="list" aria-label="Lista de entidades">
      {filtered.map(e => <li key={e.id}><EntityCard entity={e} /></li>)}
    </ul>
  );
}
```

## Reglas de accesibilidad

| Elemento | Regla |
|---------|-------|
| Botones de acción | `aria-label` descriptivo siempre |
| Inputs HeroUI | `aria-label` (Playwright lo usa así) |
| Links de navegación | `aria-label="Abrir X: {nombre}"` |
| Listas | `role="list"` + `aria-label` |
| Errores | `<p role="alert" className={ERROR_CLASSES}>` |
| Filtros | `role="group"` + `aria-label` en el wrapper |
| Secciones | `aria-labelledby` apuntando al `id` del heading |
