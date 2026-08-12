import { useAppContext } from '../context/AppContext'
import { useTabData } from '../hooks/useTabData'
import { apiRoutes } from '../config/api-routes'

interface AppreciationRow {
  'Appreciation Given To': string
  'Appreciation Given By': string
  'Job Name': string
  'Appreciation Given Date': string
  'Vertical': string
  'Description': string
}

function initials(name: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function AppreciationTab() {
  const { appliedFilters } = useAppContext()
  const { data, loading, error } = useTabData<AppreciationRow>(
    'appreciation',
    apiRoutes.insights.appreciation
  )

  if (!appliedFilters) {
    return <EmptyState message="Select filters and click Apply to load appreciation data." />
  }
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data || data.length === 0) return <EmptyState message="No appreciation records for the selected filters." />

  const sorted = [...data].sort(
    (a, b) =>
      new Date(b['Appreciation Given Date']).getTime() -
      new Date(a['Appreciation Given Date']).getTime()
  )

  return (
    <div className="space-y-3 max-h-[calc(100vh-266px)] overflow-y-auto pr-1">
      {sorted.map((row, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-maroon/10 text-maroon flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initials(row['Appreciation Given To'])}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row['Appreciation Given To']}</p>
                  <p className="text-xs text-gray-500">{row['Job Name']}</p>
                  {row['Vertical'] && (
                    <span className="inline-block mt-1 text-xs bg-maroon/10 text-maroon px-2 py-0.5 rounded-full">
                      {row['Vertical']}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {row['Appreciation Given Date']}
                </span>
              </div>
              <blockquote className="mt-3 text-sm text-gray-700 italic border-l-2 border-maroon pl-3">
                {row['Description']}
              </blockquote>
              <p className="mt-2 text-xs text-gray-400">
                Appreciated by <span className="font-medium text-gray-600">{row['Appreciation Given By']}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
      {sorted.map((row, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-maroon/10 text-maroon flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {initials(row['Appreciation Given To'])}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{row['Appreciation Given To']}</p>
                  <p className="text-xs text-gray-500">{row['Job Name']}</p>
                  {row['Vertical'] && (
                    <span className="inline-block mt-1 text-xs bg-maroon/10 text-maroon px-2 py-0.5 rounded-full">
                      {row['Vertical']}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                  {row['Appreciation Given Date']}
                </span>
              </div>
              <blockquote className="mt-3 text-sm text-gray-700 italic border-l-2 border-maroon pl-3">
                {row['Description']}
              </blockquote>
              <p className="mt-2 text-xs text-gray-400">
                Appreciated by <span className="font-medium text-gray-600">{row['Appreciation Given By']}</span>
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="py-12 flex justify-center">
      <svg className="animate-spin h-6 w-6 text-maroon" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return <div className="py-12 text-center text-sm text-red-500">{message}</div>
}

function EmptyState({ message }: { message: string }) {
  return <div className="py-12 text-center text-sm text-gray-400">{message}</div>
}
