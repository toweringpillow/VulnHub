'use client'

import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

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
        setError(null)
        const response = await fetch('/api/reddit/trending', {
          cache: 'no-store',
        })
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }
        
        const data = await response.json()

        if (data.success && data.data && data.data.length > 0) {
          setTrending(data.data)
        } else {
          console.warn('No trending data received:', data)
        }
      } catch (error) {
        console.error('Error fetching trending keywords:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Don't show anything if loading or no data (silent fail for now)
  if (loading || trending.length === 0) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-destructive/20 via-primary-500/20 to-destructive/20 border-b border-primary-500/30 py-2 overflow-hidden relative">
      {/* Scrolling background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent animate-pulse" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          {/* Label */}
          <div className="flex items-center gap-2 flex-shrink-0 text-sm font-semibold text-primary-400">
            <TrendingUp className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">Trending on Reddit:</span>
            <span className="sm:hidden">Trending:</span>
          </div>

          {/* Scrolling keywords */}
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-4 animate-scroll whitespace-nowrap [&:hover]:[animation-play-state:paused]">
              {/* First set */}
              {trending.map((item, index) => (
                <Link
                  key={`first-${index}`}
                  href={`/search?q=${encodeURIComponent(item.keyword)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 hover:text-primary-200 transition-all duration-200 text-sm font-medium border border-primary-500/30 hover:border-primary-500/50 hover:scale-105"
                >
                  <span>#{item.keyword}</span>
                  <span className="text-xs text-primary-400 opacity-75">
                    {item.count}
                  </span>
                </Link>
              ))}
              {/* Duplicate set for seamless loop */}
              {trending.map((item, index) => (
                <Link
                  key={`second-${index}`}
                  href={`/search?q=${encodeURIComponent(item.keyword)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/20 hover:bg-primary-500/30 text-primary-300 hover:text-primary-200 transition-all duration-200 text-sm font-medium border border-primary-500/30 hover:border-primary-500/50 hover:scale-105"
                >
                  <span>#{item.keyword}</span>
                  <span className="text-xs text-primary-400 opacity-75">
                    {item.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

