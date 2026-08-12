// src/context/AppContext.tsx
import { createContext, useContext } from 'react';

export interface AppContextType {
  userData?: Record<string, any>;
  selectedClientUser?: Record<string, any>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => useContext(AppContext);
