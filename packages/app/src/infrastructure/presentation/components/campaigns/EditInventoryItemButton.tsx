'use client';

import { useState, useTransition } from 'react';
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Checkbox,
  useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES } from '@/constants/ui';
import { TAG_OPTIONS } from '@/constants/domain';
import { apiPut } from '@/lib/api';
import type { EmbeddedItem, TagType } from '@/infrastructure/presentation/components/campaigns/InventoryItem';

interface EditInventoryItemButtonProps {
  campaignId: string;
  item: EmbeddedItem;
  onUpdated?: () => void;
}

interface FormState {
  title: string;
  description: string;
  quantity: string;
  value: string;
  tags: TagType[];
}

function formFromItem(item: EmbeddedItem): FormState {
  return {
    title: item.title,
    description: item.description,
    quantity: String(item.quantity),
    value: String(item.value ?? 0),
    tags: [...item.tags],
  };
}

/**
 * Edit button that opens a pre-filled modal form for updating an inventory item.
 * Calls `onUpdated()` after a successful PUT so the parent can refresh its list.
 */
export function EditInventoryItemButton({ campaignId, item, onUpdated }: EditInventoryItemButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(formFromItem(item));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen() {
    setForm(formFromItem(item));
    setError(null);
    onOpen();
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleFieldChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  }

  function handleTagToggle(tag: TagType, checked: boolean) {
    setForm((prev) => ({
      ...prev,
      tags: checked
        ? [...prev.tags, tag]
        : prev.tags.filter((t) => t !== tag),
    }));
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('El nombre del objeto es obligatorio.');
      return;
    }

    const quantity = parseInt(form.quantity, 10);
    if (isNaN(quantity) || quantity < 0) {
      setError('La cantidad debe ser un número igual o mayor que 0.');
      return;
    }

    const value = parseFloat(form.value);
    if (isNaN(value) || value < 0) {
      setError('El valor no puede ser negativo.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPut(`/api/campaign/${campaignId}/inventory/${item.id}`, {
        title: form.title.trim(),
        description: form.description.trim(),
        quantity,
        value,
        tags: form.tags,
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      onUpdated?.();
      handleClose();
    });
  }

  return (
    <>
      <Button
        onPress={handleOpen}
        variant="flat"
        color="default"
        size="sm"
        className="text-zinc-400 hover:text-white"
        aria-label="Editar objeto"
      >
        Editar
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleClose}
        placement="center"
        size="lg"
        classNames={MODAL_CLASSES}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Editar objeto
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Input
                  label="Nombre"
                  placeholder="Nombre del objeto"
                  value={form.title}
                  onValueChange={(val) => handleFieldChange('title', val)}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Nombre del objeto"
                />

                <Textarea
                  label="Descripción"
                  placeholder="Describe brevemente el objeto..."
                  value={form.description}
                  onValueChange={(val) => handleFieldChange('description', val)}
                  isDisabled={isPending}
                  minRows={2}
                  maxRows={4}
                  classNames={INPUT_CLASSES}
                  aria-label="Descripción del objeto"
                />

                <div className="flex gap-3">
                  <Input
                    label="Cantidad"
                    placeholder="1"
                    type="number"
                    min={0}
                    value={form.quantity}
                    onValueChange={(val) => handleFieldChange('quantity', val)}
                    isDisabled={isPending}
                    classNames={INPUT_CLASSES}
                    aria-label="Cantidad del objeto"
                  />
                  <Input
                    label="Valor (gp)"
                    placeholder="0"
                    type="number"
                    min={0}
                    step={0.1}
                    value={form.value}
                    onValueChange={(val) => handleFieldChange('value', val)}
                    isDisabled={isPending}
                    classNames={INPUT_CLASSES}
                    aria-label="Valor del objeto en piezas de oro"
                  />
                </div>

                <div>
                  <p className="text-zinc-300 text-sm mb-2">Etiquetas</p>
                  <div className="flex flex-wrap gap-3">
                    {TAG_OPTIONS.map((opt) => (
                      <Checkbox
                        key={opt.key}
                        isSelected={form.tags.includes(opt.key as TagType)}
                        onValueChange={(checked) => handleTagToggle(opt.key as TagType, checked)}
                        isDisabled={isPending}
                        classNames={{ label: 'text-zinc-300 text-sm' }}
                      >
                        {opt.label}
                      </Checkbox>
                    ))}
                  </div>
                </div>

                {error && (
                  <p role="alert" className={ERROR_CLASSES}>
                    {error}
                  </p>
                )}
              </ModalBody>

              <ModalFooter className="gap-2">
                <Button
                  type="button"
                  variant="flat"
                  color="default"
                  onPress={handleClose}
                  isDisabled={isPending}
                  className="text-zinc-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isPending}
                  isDisabled={isPending}
                  className="font-medium"
                >
                  {isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
