import React, { createContext, useContext, useState } from "react";
import type { QueryMaster } from "../../../core/models/master";
import { defaultQueryMaster } from "../../../core/models/master";

export interface QueryMasterContextType {
  queryMasters?: QueryMaster;
  setQueryMasters?: (master: QueryMaster) => void;
}

export const QueryMasterContext = createContext<QueryMasterContextType | null>(null);

export const useQueryMasterContext = () => {
  const context = useContext(QueryMasterContext);
  if (!context) {
    throw new Error("useQueryMasterContext must be used inside QueryMasterProvider");
  }
  return context;
};

export function QueryMasterProvider({ children }: { children: React.ReactNode }) {
  const [master, setMaster] = useState<QueryMaster>(defaultQueryMaster);

  return (
    <QueryMasterContext.Provider value={{ queryMasters: master, setQueryMasters: setMaster }}>
      {children}
    </QueryMasterContext.Provider>
  );
}