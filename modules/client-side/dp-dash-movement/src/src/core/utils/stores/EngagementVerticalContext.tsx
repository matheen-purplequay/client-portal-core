import React, { createContext, useContext, useState } from "react";
import type { EngagementVertical } from "../../models/vertical";

export interface EngagementVerticalContextType {
  vertical?: EngagementVertical;
  setVertical?: (vertical: EngagementVertical) => void;
  activeView: 'live-data' | 'reports' | 'lodgement';
  setActiveView: (view: 'live-data' | 'reports' | 'lodgement') => void;
}

export const EngagementVerticalContext = createContext<EngagementVerticalContextType | undefined>(undefined);

export const useEngagementVerticalContext = () => {
  const context = useContext(EngagementVerticalContext);
  if (!context) {
    throw new Error("useEngagementVerticalContext must be used inside EngagementVerticalProvider");
  }
  return context;
};

export function EngagementVerticalProvider({ children }: { children: React.ReactNode }) {
  const [vertical, setVertical] = useState<EngagementVertical | undefined>(undefined); // default page
  const [activeView, setActiveView] = useState<'live-data' | 'reports' | 'lodgement'>('live-data');

  return (
    <EngagementVerticalContext.Provider value={{ vertical, setVertical, activeView, setActiveView }}>
      {children}
    </EngagementVerticalContext.Provider>
  );
}
