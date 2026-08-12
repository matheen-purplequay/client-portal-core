import { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { apiRoutes } from '../config/api-routes'
import type { AppliedFilters } from '../context/AppContext'

interface KeyUpdateItem {
  id: number
  description: string
  image_count: number
}

function filterKey(filters: AppliedFilters, projectId: string | null): string {
  return `${projectId}|${filters.month}`
}

export function KeyUpdatesTab() {
  const { appliedFilters, activeTab, projectId } = useAppContext()
  const cache = useRef<Record<string, KeyUpdateItem[]>>({})
  const [data, setData] = useState<KeyUpdateItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultKey, setResultKey] = useState<string | null>(null)

  const isActive = activeTab === 'key-updates'

  useEffect(() => {
    if (!appliedFilters || !isActive) return

    const key = filterKey(appliedFilters, projectId)

    if (cache.current[key]) {
      setResultKey(key)
      setData(cache.current[key])
      return
    }

    setLoading(true)
    setError(null)

    fetch(apiRoutes.insights.keyUpdates, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, month: appliedFilters.month }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((json: { status: boolean; data: KeyUpdateItem[] }) => {
        const result = json.status ? json.data : []
        cache.current[key] = result
        setResultKey(key)
        setData(result)
      })
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [appliedFilters, isActive, projectId])

  const currentKey = appliedFilters ? filterKey(appliedFilters, projectId) : null
  const visibleData = data && currentKey && resultKey === currentKey ? data : null

  if (!appliedFilters) {
    return <EmptyState message="Select filters and click Apply to load key updates." />
  }
  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />
  if (!visibleData || visibleData.length === 0) {
    return <EmptyState message="No key updates for the selected month." />
  }

  return (
    <div className="space-y-4 max-h-[calc(100vh-190px)] overflow-y-auto pr-1">
      {visibleData.map((item, index) => (
        <div key={item.id}>
          {index === 0 ? (
            <IntroCard description={item.description} imageCount={item.image_count} />
          ) : (
            <UpdateCard description={item.description} imageCount={item.image_count} />
          )}
        </div>
      ))}
    </div>
  )
}

function IntroCard({ description, imageCount }: { description: string; imageCount: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div
        className="px-6 py-5 text-sm leading-relaxed text-gray-700"
        style={{ background: '#eef2fb', borderTop: '4px solid #1e3c72' }}
        dangerouslySetInnerHTML={{ __html: description }}
      />
      {imageCount > 0 && <ImagePlaceholders count={imageCount} />}
    </div>
  )
}

function UpdateCard({ description, imageCount }: { description: string; imageCount: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="px-6 py-5 flex gap-4 items-start" style={{ borderLeft: '4px solid #2a5298' }}>
        <span
          className="flex-shrink-0 flex items-center justify-center text-white text-base font-semibold rounded-full"
          style={{
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
            marginTop: 1,
          }}
        >
          ✓
        </span>
        <div
          className="text-sm leading-relaxed text-gray-700 flex-1"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
      {imageCount > 0 && <ImagePlaceholders count={imageCount} />}
    </div>
  )
}

function ImagePlaceholders({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <div className="px-6 pb-5 flex flex-wrap gap-3 hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400"
          style={{ width: 200, height: 120 }}
        >
          Image unavailable
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
  return <div className="py-12 text-center text-gray-400">
    <div className='bg-white rounded-lg text-md shadow-md px-12 py-5 inline-flex'>
      {message}
    </div>
  </div>
}
