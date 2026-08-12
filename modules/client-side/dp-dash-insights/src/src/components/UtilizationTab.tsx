import { useAppContext } from '../context/AppContext'
import { useTabData } from '../hooks/useTabData'
import { apiRoutes } from '../config/api-routes'
import { parseMonth, subtractMonths, formatMonthValue, monthShortLabel, spMonthKey } from '../utils/month'

// SP: SP_AssociateProductivity_Last3Months(month, client_id, vertical_id)
// Dynamic month columns are named e.g. "Mar-2026" — accessed via bracket notation
interface UtilizationRow {
  ContractType: string
  Vertical: string
  AssociateName: string
  MonthBudget: number
  Average: number
  Capacity_Total?: number
  [month: string]: string | number | undefined
}


export function UtilizationTab() {
  const { appliedFilters } = useAppContext()
  const { data, loading, error } = useTabData<UtilizationRow>('utilization', apiRoutes.insights.utilization)

  if (!appliedFilters) {
    return <EmptyState message="Select filters and click Apply to load utilization data." />
  }
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data || data.length === 0) return <EmptyState message="No utilization data for the selected filters." />

  const selectedDate = parseMonth(appliedFilters.month)
  const m3 = formatMonthValue(subtractMonths(selectedDate, 3))
  const m2 = formatMonthValue(subtractMonths(selectedDate, 2))
  const m1 = formatMonthValue(subtractMonths(selectedDate, 1))
  const col0 = monthShortLabel(m3)
  const col1 = monthShortLabel(m2)
  const col2 = monthShortLabel(m1)
  const spKey0 = spMonthKey(m3)
  const spKey1 = spMonthKey(m2)
  const spKey2 = spMonthKey(m1)

  const tableRows = data.filter(r => r.ContractType !== 'TOTAL' && r.ContractType !== 'CAPACITY')
  const totalRow = data.find(r => r.ContractType === 'TOTAL')
  const capacityRow = data.find(r => r.ContractType === 'CAPACITY')
  const capacityPercent = capacityRow?.Capacity_Total

  return (
    <div className="space-y-6">
      {/* KPI Card — Monthly Capacity % */}
      <div className="inline-flex items-center gap-4 bg-white border border-gray-200 rounded-lg px-6 py-4 shadow-sm">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-maroon/10">
          <svg className="w-5 h-5 text-maroon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Monthly Capacity</p>
          <p className="text-2xl font-semibold text-gray-900">
            {capacityPercent !== undefined ? String(capacityPercent) : '—'}
          </p>
        </div>
      </div>

      {/* Table — Productivity for FTE (Last 3 Months) */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Productivity for FTE (Last 3 Months)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Mode of Contract</th>
                <th className="px-4 py-3 text-left">Vertical</th>
                <th className="px-4 py-3 text-left">Associate Name</th>
                <th className="px-4 py-3 text-right">Committed Hrs</th>
                <th className="px-4 py-3 text-right">{col0}</th>
                <th className="px-4 py-3 text-right">{col1}</th>
                <th className="px-4 py-3 text-right">{col2}</th>
                <th className="px-4 py-3 text-right">Average</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {tableRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{row.ContractType}</td>
                  <td className="px-4 py-3">{row.Vertical}</td>
                  <td className="px-4 py-3">{row.AssociateName}</td>
                  <td className="px-4 py-3 text-right">{row.MonthBudget}</td>
                  <td className="px-4 py-3 text-right">{row[spKey0]}</td>
                  <td className="px-4 py-3 text-right">{row[spKey1]}</td>
                  <td className="px-4 py-3 text-right">{row[spKey2]}</td>
                  <td className="px-4 py-3 text-right">{row.Average}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold text-gray-700 border-t border-gray-200">
              <tr>
                <td className="px-4 py-3" colSpan={3}>TOTAL</td>
                <td className="px-4 py-3 text-right">{totalRow?.MonthBudget ?? '—'}</td>
                <td className="px-4 py-3 text-right">{totalRow?.[spKey0] ?? '—'}</td>
                <td className="px-4 py-3 text-right">{totalRow?.[spKey1] ?? '—'}</td>
                <td className="px-4 py-3 text-right">{totalRow?.[spKey2] ?? '—'}</td>
                <td className="px-4 py-3 text-right">{totalRow?.Average ?? '—'}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
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
