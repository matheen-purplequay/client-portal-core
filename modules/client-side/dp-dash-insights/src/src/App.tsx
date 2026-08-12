import { AppProvider } from './context/AppContext'
import { FilterBar } from './components/FilterBar'
import { TabNav } from './components/TabNav'
import { KeyUpdatesTab } from './components/KeyUpdatesTab'
import { UtilizationTab } from './components/UtilizationTab'
import { FeedbackTab } from './components/FeedbackTab'
import { AppreciationTab } from './components/AppreciationTab'
import { useAppContext } from './context/AppContext'

function TabPanels() {
  const { activeTab } = useAppContext()
  return (
    <div className="p-6">
      {/* All panels stay mounted so each tab's data cache is preserved on revisit */}
      <div className={activeTab === 'key-updates' ? '' : 'hidden'}><KeyUpdatesTab /></div>
      <div className={activeTab === 'utilization' ? '' : 'hidden'}><UtilizationTab /></div>
      <div className={activeTab === 'feedback' ? '' : 'hidden'}><FeedbackTab /></div>
      <div className={activeTab === 'appreciation' ? '' : 'hidden'}><AppreciationTab /></div>
    </div>
  )
}

interface AppProps {
  clientId: string | null
  companyId: string | null
  projectId: string | null
}

function App({ clientId, companyId, projectId }: AppProps) {
  return (
    <AppProvider clientId={clientId} companyId={companyId} projectId={projectId}>
      <div className="min-h-screen bg-gray-50 font-sans">
        <FilterBar />
        <TabNav />
        <TabPanels />
      </div>
    </AppProvider>
  )
}

export default App
