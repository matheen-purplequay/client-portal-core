import React, { createContext, useContext, useState } from "react";

export interface PageContextType {
  page?: string;
  setPage?: (page: string) => void;
}

export const PageContext = createContext<PageContextType | null>(null);

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error("usePageContext must be used inside PageProvider");
  }
  return context;
};

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<string>("movement"); // default page

  return (
    <PageContext.Provider value={{ page, setPage }}>
      {children}
    </PageContext.Provider>
  );
}
