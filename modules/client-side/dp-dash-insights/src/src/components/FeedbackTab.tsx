import { useAppContext } from '../context/AppContext'
import { useTabData } from '../hooks/useTabData'
import { apiRoutes } from '../config/api-routes'
import { parseMonth, subtractMonths, formatMonthValue, monthShortLabel } from '../utils/month'

// SP: sp_ClientFeedback_ClientDelivery_shibu_1(month, client_id, vertical_id)
interface FeedbackRow {
  'Feedback Given By': string
  'Feedback Given To': string
  Vertical: string
  'Feedback Given Date': string
  'Job Name': string
  Description: string
  ActionTaken: string
  Hours: number
  Comments: string
}

// SP: SP_Feedback_Percentage_shibu(month, client_id, vertical_id)
interface FeedbackSummary {
  Feedback: number
  TotalJobs: number
  Percentage: string
}

export function FeedbackTab() {
  const { appliedFilters } = useAppContext()
  const { data, loading, error } = useTabData<FeedbackRow>('feedback', apiRoutes.insights.feedback)
  const { data: summaryData } = useTabData<FeedbackSummary>('feedback', apiRoutes.insights.feedbackSummary)

  if (!appliedFilters) {
    return <EmptyState message="Select filters and click Apply to load feedback data." />
  }
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!data || data.length === 0) return <EmptyState message="No feedback data for the selected filters." />

  const selectedDate = parseMonth(appliedFilters.month)
  const rangeStart = monthShortLabel(formatMonthValue(subtractMonths(selectedDate, 6)))
  const rangeEnd = monthShortLabel(appliedFilters.month)

  const summary = summaryData?.[0]

  const kpiCards: { label: string; value: string | number }[] = [
    { label: 'Feedback Count', value: summary?.Feedback ?? '—' },
    { label: 'Total Jobs Received', value: summary?.TotalJobs ?? '—' },
    { label: 'Performance', value: summary?.Percentage ?? '—' },
  ]

  return (
    <div className="space-y-6 max-h-[calc(100vh-190px)] overflow-y-auto pr-1">
      {/* 3 KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-lg px-5 py-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Table — Client Feedback Details */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Client Feedback Details</h3>
          <span className="text-xs text-gray-400">{rangeStart} – {rangeEnd}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Feedback Given By</th>
                <th className="px-4 py-3 text-left">Feedback Given To</th>
                <th className="px-4 py-3 text-left">Vertical</th>
                <th className="px-4 py-3 text-left">Feedback Date</th>
                <th className="px-4 py-3 text-left">Job Name</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-center">Action Taken</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3 text-left">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{row['Feedback Given By']}</td>
                  <td className="px-4 py-3">{row['Feedback Given To']}</td>
                  <td className="px-4 py-3">{row.Vertical}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row['Feedback Given Date']}</td>
                  <td className="px-4 py-3">{row['Job Name']}</td>
                  <td className="px-4 py-3">{row.Description}</td>
                  <td className="px-4 py-3 text-center">
                    {row.ActionTaken ? (
                      <span className="text-green-600 font-medium">✓</span>
                    ) : (
                      <span className="text-red-500 font-medium">✗</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{row.Hours}</td>
                  <td className="px-4 py-3">{row.Comments}</td>
                </tr>
              ))}
            </tbody>
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
