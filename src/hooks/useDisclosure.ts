import { useState } from 'react';

export interface UseDisclosure {
  onOpen(): void;
  onClose(): void;
  onToggle(): void;
  isOpen: boolean;
}

export type UseDisclosureProps = Partial<Omit<UseDisclosure, 'isOpen'>>;

export default function useDisclosure(defaultOpen = false, props: UseDisclosureProps = {}): UseDisclosure {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const onOpen = () => {
    setIsOpen(true);

    props.onOpen?.();
  };

  const onClose = () => {
    setIsOpen(false);

    props.onClose?.();
  };

  const onToggle = () => {
    setIsOpen(!isOpen);

    props.onToggle?.();
  };

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}
