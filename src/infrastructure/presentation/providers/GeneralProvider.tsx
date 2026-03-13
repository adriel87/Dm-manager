'use client';

import { HeroUIProvider } from '@heroui/system';

interface GeneralProviderProps {
  children: React.ReactNode;
}

export const GeneralProvider = ({ children }: GeneralProviderProps) => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};
