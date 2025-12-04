'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, AlertCircle } from 'lucide-react'

interface TrendingKeyword {
  keyword: string
  score: number
  count: number
}

export default function TrendingBanner() {
  const [trending, setTrending] = useState<TrendingKeyword[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrending() {
      try {
        console.log('Fetching trending keywords...')
        const response = await fetch('/api/reddit/trending')
        console.log('Response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Trending data:', data)
          console.log('Trending array length:', data.data?.length || 0)
          console.log('Trending items:', data.data)
          const trendingArray = data.data || []
          setTrending(trendingArray)
          if (trendingArray.length === 0) {
            console.warn('No trending keywords found - Reddit may not have returned matching keywords')
          }
          setError(null)
        } else {
          const errorText = await response.text()
          console.error('Failed to fetch trending:', response.status, errorText)
          setError(`Failed to load trending topics (${response.status})`)
        }
      } catch (error) {
        console.error('Error fetching trending keywords:', error)
        setError('Unable to connect to trending service')
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Show nothing while loading
  if (loading) {
    return null
  }

  // Show error message if there's an error
  if (error && trending.length === 0) {
    return (
      <div className="bg-dark-800/50 border-y border-dark-700">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center gap-2 text-yellow-500/70 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    )
  }

  // Don't show if no trending topics
  if (trending.length === 0) {
    console.log('TrendingBanner: No trending keywords to display')
    return null
  }

  console.log(`TrendingBanner: Rendering ${trending.length} trending keywords`)

  return (
    <div className="bg-dark-800/50 border-y border-dark-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 text-primary-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Trending:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {trending.slice(0, 10).map((item, index) => (
              <Link
                key={index}
                href={`/search?q=${encodeURIComponent(item.keyword)}`}
                className="px-3 py-1 rounded-full bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-sm font-medium transition-colors border border-primary-500/30 whitespace-nowrap"
              >
                {item.keyword}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
