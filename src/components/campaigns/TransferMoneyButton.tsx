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
  Select,
  SelectItem,
  useDisclosure,
} from '@heroui/react';
import { INPUT_CLASSES, MODAL_CLASSES, ERROR_CLASSES, SELECT_CLASSES } from '@/constants/ui';
import { apiPost } from '@/lib/api';

interface TransferMoneyButtonProps {
  campaignId: string;
  onTransferred?: () => void;
}

interface FormState {
  amount: string;
  type: 'add' | 'subtract';
}

const EMPTY_FORM: FormState = { amount: '', type: 'add' };

const TRANSFER_OPTIONS = [
  { key: 'add', label: 'Añadir' },
  { key: 'subtract', label: 'Restar' },
] as const;

export function TransferMoneyButton({ campaignId, onTransferred }: TransferMoneyButtonProps) {
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClose() {
    setForm(EMPTY_FORM);
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('El monto debe ser un número mayor que 0.');
      return;
    }

    startTransition(async () => {
      const { error: apiError } = await apiPost(`/api/campaign/${campaignId}/inventory/money`, {
        amount,
        type: form.type,
      });

      if (apiError) {
        setError(apiError);
        return;
      }

      onTransferred?.();
      handleClose();
    });
  }

  return (
    <>
      <Button
        onPress={onOpen}
        color="warning"
        variant="flat"
        size="sm"
        className="font-medium"
        aria-label="Transferir dinero del inventario"
      >
        💰 Transferir
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={handleClose}
        placement="center"
        size="sm"
        classNames={MODAL_CLASSES}
      >
        <ModalContent>
          {() => (
            <form onSubmit={handleSubmit} noValidate>
              <ModalHeader className="text-white text-lg font-semibold">
                Transferencia de dinero
              </ModalHeader>

              <ModalBody className="gap-4 py-5">
                <Select
                  label="Tipo"
                  selectedKeys={[form.type]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as FormState['type'];
                    if (selected) setForm((prev) => ({ ...prev, type: selected }));
                    if (error) setError(null);
                  }}
                  isDisabled={isPending}
                  classNames={SELECT_CLASSES}
                  aria-label="Tipo de transferencia"
                >
                  {TRANSFER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>

                <Input
                  label="Monto (gp)"
                  placeholder="0"
                  type="number"
                  min={0}
                  step={0.1}
                  value={form.amount}
                  onValueChange={(val) => {
                    setForm((prev) => ({ ...prev, amount: val }));
                    if (error) setError(null);
                  }}
                  isRequired
                  isDisabled={isPending}
                  autoFocus
                  classNames={INPUT_CLASSES}
                  aria-label="Monto a transferir en piezas de oro"
                />

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
                  color="warning"
                  isLoading={isPending}
                  isDisabled={isPending}
                  className="font-medium"
                >
                  {isPending ? 'Procesando...' : 'Confirmar'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
