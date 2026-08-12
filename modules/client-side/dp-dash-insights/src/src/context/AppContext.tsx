import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type TabId = 'key-updates' | 'utilization' | 'feedback' | 'appreciation'

export interface AppliedFilters {
  month: string
  verticals: number[]
}

interface AppContextValue {
  clientId: string | null
  companyId: string | null
  projectId: string | null
  month: string
  setMonth: (month: string) => void
  verticals: number[]
  setVerticals: (verticals: number[]) => void
  appliedFilters: AppliedFilters | null
  applyFilters: () => void
  activeTab: TabId
  setActiveTab: (tab: TabId) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function currentMonthStr(): string {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yyyy = now.getFullYear()
  return `${mm}-${yyyy}`
}

interface AppProviderProps {
  clientId: string | null
  companyId: string | null
  projectId: string | null
  children: ReactNode
}

export function AppProvider({ clientId, companyId, projectId, children }: AppProviderProps) {
  const [month, setMonth] = useState(currentMonthStr)
  const [verticals, setVerticals] = useState<number[]>([])
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('key-updates')

  function applyFilters() {
    setAppliedFilters({ month, verticals })
  }

  return (
    <AppContext.Provider
      value={{
        clientId,
        companyId,
        projectId,
        month,
        setMonth,
        verticals,
        setVerticals,
        appliedFilters,
        applyFilters,
        activeTab,
        setActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider')
  return ctx
}
