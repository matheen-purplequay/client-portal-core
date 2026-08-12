import { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { apiRoutes } from '../config/api-routes'

interface Vertical {
  id: number
  new_service_id: number
  title: string
}

function buildMonthOptions(): { label: string; value: string }[] {
  const options = []
  const now = new Date()
  for (let i = 0; i < 13; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const value = `${mm}-${yyyy}`
    options.push({ label: value, value })
  }
  return options
}

const MONTH_OPTIONS = buildMonthOptions()

export function FilterBar() {
  const { projectId, month, setMonth, verticals, setVerticals, applyFilters } = useAppContext()
  const [allVerticals, setAllVerticals] = useState<Vertical[]>([])
  const [verticalsError, setVerticalsError] = useState(false)

  useEffect(() => {
    fetch(apiRoutes.insights.getVerticals, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId }),
    })
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then((json: { status: boolean; data: Vertical[] }) => {
        if (json.status) {
          const seen = new Set<number>()
          const unique = json.data.filter((v) => {
            if (seen.has(v.new_service_id)) return false
            seen.add(v.new_service_id)
            return true
          })
          setAllVerticals(unique)
        } else throw new Error()
      })
      .catch(() => setVerticalsError(true))
  }, [projectId])

  function toggleVertical(wmId: number) {
    setVerticals(
      verticals.includes(wmId)
        ? verticals.filter((x) => x !== wmId)
        : [...verticals, wmId]
    )
  }

  function removeVertical(wmId: number) {
    setVerticals(verticals.filter((x) => x !== wmId))
  }

  function getTitle(wmId: number): string {
    return allVerticals.find((v) => v.new_service_id === wmId)?.title ?? String(wmId)
  }

  const unselected = allVerticals.filter((v) => !verticals.includes(v.new_service_id))

  return (
    <div className="flex flex-wrap items-end gap-4 px-6 py-4 bg-white border-b border-gray-200 select-none">
      {/* Month */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Month
        </label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-maroon"
        >
          {MONTH_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Vertical multi-select */}
      <div className="flex flex-col gap-1 flex-1 min-w-48">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Vertical
        </label>
        <div className="border border-gray-300 rounded flex flex-wrap gap-1.5 items-center bg-white">
          {verticals.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1 bg-maroon/10 text-maroon text-xs font-medium px-2 py-1.5"
            >
              {getTitle(id)}
              <button
                type="button"
                onClick={() => removeVertical(id)}
                className="hover:text-maroon/70 leading-none px-2 cursor-pointer font-bold"
                aria-label={`Remove ${getTitle(id)}`}
              >
                &times;
              </button>
            </span>
          ))}
          <div className="relative">
            {verticalsError ? (
              <span className="text-xs text-red-500px-2 py-1.5">Failed to load verticals</span>
            ) : (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) toggleVertical(Number(e.target.value))
                }}
                className="text-sm text-gray-400 px-3 py-1.5 border-0 focus:outline-none bg-transparent cursor-pointer"
              >
                <option value="" disabled>
                  {allVerticals.length === 0
                    ? 'Loading…'
                    : verticals.length === 0
                    ? 'Select verticals…'
                    : 'Add more…'}
                </option>
                {unselected.map((v) => (
                  <option key={v.new_service_id} value={v.new_service_id}>
                    {v.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Apply */}
      <button
        type="button"
        onClick={applyFilters}
        className="px-5 py-1.5 bg-maroon text-white text-sm font-medium rounded-full shadow hover:shadow-lg hover:bg-maroon/90 focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-offset-1 transition-colors transition-shadow"
      >
        Apply
      </button>
    </div>
  )
}
