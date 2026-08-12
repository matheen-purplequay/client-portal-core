import { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import type { TabId, AppliedFilters } from '../context/AppContext'

function filterKey(filters: AppliedFilters, projectId: string | null): string {
  return `${projectId}|${filters.month}|${[...filters.verticals].sort().join(',')}`
}

export function useTabData<T = Record<string, unknown>>(
  tabId: TabId,
  endpoint: string
): { data: T[] | null; loading: boolean; error: string | null } {
  const { appliedFilters, activeTab, projectId } = useAppContext()
  const cache = useRef<Record<string, T[]>>({})
  const [result, setResult] = useState<{ key: string; data: T[] } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActive = activeTab === tabId

  useEffect(() => {
    if (!appliedFilters || !isActive) return

    const key = filterKey(appliedFilters, projectId)

    if (cache.current[key]) {
      setResult({ key, data: cache.current[key] })
      return
    }

    setLoading(true)
    setError(null)

    const { month, verticals } = appliedFilters

    // Fan out one request per selected vertical; no verticals = single call (vertical_id 0 = all)
    const targets: (number | null)[] = verticals.length > 0 ? verticals : [null]

    Promise.all(
      targets.map((v) =>
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectId,
            month,
            vertical_id: v !== null ? v : 0,
          }),
        })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`)
            return r.json()
          })
          .then((json: { status: boolean; data: T[] }) =>
            json.status ? json.data : []
          )
      )
    )
      .then((results) => {
        const merged = results.flat() as T[]
        cache.current[key] = merged
        setResult({ key, data: merged })
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [appliedFilters, isActive, endpoint, tabId, projectId])

  const currentKey = appliedFilters ? filterKey(appliedFilters, projectId) : null
  const data = result && currentKey && result.key === currentKey ? result.data : null

  return { data, loading, error }
}
