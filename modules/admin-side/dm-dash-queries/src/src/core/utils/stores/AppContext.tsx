// src/context/AppContext.tsx
import { createContext, useContext } from 'react';

export interface AppContextType {
  userData?: Record<string, any>;
  isClient?: boolean;
  jobId?: string | null;
}

export const AppContext = createContext<AppContextType | null>({
    userData: undefined,
    isClient: false,
    jobId: null
});

export const useAppContext = () => useContext(AppContext);
