'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export interface StoreConfig {
  slug: string;
  name: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    logoUrl?: string;
  };
}

interface StoreContextType {
  store: StoreConfig;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({
  store,
  children,
}: {
  store: StoreConfig;
  children: ReactNode;
}) {
  return (
    <StoreContext.Provider value={{ store }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
