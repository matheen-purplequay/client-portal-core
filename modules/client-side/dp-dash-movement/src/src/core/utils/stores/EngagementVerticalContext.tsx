import React, { createContext, useContext, useEffect, useState } from "react";
import type { EngagementVertical } from "../../models/vertical";
import { apiRoutes } from "../../../config/api-routes";
import { getPostData } from "../helpers/fetch";
import { useAppContext } from "./AppContext";

export interface EngagementVerticalContextType {
  vertical?: EngagementVertical;
  setVertical?: (vertical: EngagementVertical) => void;
  // The full list of verticals for this client — fetched once here instead
  // of by every QuickLinksPanel instance. Each of the BS/BK/FP/SMSF job
  // tables used to mount its own QuickLinksPanel, which each independently
  // called /client/get-verticals on mount, quadrupling that request (plus
  // its CORS preflight) for no reason — they all want the same data.
  verticals: EngagementVertical[];
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

// Default to Business Services (wm_vertical_id: 1) so the job table can start
// fetching immediately instead of waiting on the /client/get-verticals round
// trip to resolve first. QuickLinksPanel overwrites this with the real list
// once it loads; the job tables' fetch effects only fire once (isFirstTimeLoaded),
// so this just removes an otherwise-sequential ~1-1.5s wait, not a real fetch.
const DEFAULT_VERTICAL: EngagementVertical = {
  id: 0,
  service_id: 0,
  engagement_id: 0,
  title: 'Business Services',
  code: 'obs',
  wm_vertical_id: 1,
  new_service_id: 0,
};

export function EngagementVerticalProvider({ children }: { children: React.ReactNode }) {
  const appContext = useAppContext();
  const [vertical, setVertical] = useState<EngagementVertical | undefined>(DEFAULT_VERTICAL);
  const [verticals, setVerticals] = useState<EngagementVertical[]>([]);
  const [activeView, setActiveView] = useState<'live-data' | 'reports' | 'lodgement'>('live-data');

  useEffect(() => {
    getPostData(apiRoutes.client.get.getVerticals, {
      client_id: appContext?.userData?.company_id
    }).then((res: any) => {
      if (res.data && res.data.length > 0) {
        setVerticals(res.data);
        setVertical(res.data[0]);
      }
    }).catch((err: any) => {
      console.log(err);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <EngagementVerticalContext.Provider value={{ vertical, setVertical, verticals, activeView, setActiveView }}>
      {children}
    </EngagementVerticalContext.Provider>
  );
}
