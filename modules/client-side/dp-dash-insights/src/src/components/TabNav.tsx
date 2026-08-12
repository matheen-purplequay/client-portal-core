import { useAppContext } from '../context/AppContext'
import type { TabId } from '../context/AppContext'

const ROW1_TABS: { id: TabId; label: string }[] = [
  { id: 'key-updates', label: 'Key Updates' },
  { id: 'utilization', label: 'Utilization' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'appreciation', label: 'Appreciation' },
]

export function TabNav() {
  const { activeTab, setActiveTab } = useAppContext()

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Row 1 */}
      <div className="flex px-6">
        {ROW1_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={[
                'px-5 py-1 font-medium border-b-2 -mb-px transition-colors focus:outline-none',
                isActive
                  ? 'border-maroon text-maroon'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ].join(' ')}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Row 2 — reserved for future tabs */}
      <div className="flex px-6 border-t border-gray-100 min-h-1" />
    </div>
  )
}
