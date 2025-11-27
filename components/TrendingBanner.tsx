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

  useEffect(() => {
    async function fetchTrending() {
      try {
        console.log('[TrendingBanner] Fetching trending keywords...')
        const response = await fetch('/api/reddit/trending', {
          cache: 'no-store',
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`[TrendingBanner] API error ${response.status}:`, errorText)
          throw new Error(`API returned ${response.status}`)
        }
        
        const data = await response.json()
        console.log('[TrendingBanner] API response:', {
          success: data.success,
          count: data.count || data.data?.length || 0,
          duration: data.duration,
          sample: data.data?.slice(0, 3),
        })

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          console.log(`[TrendingBanner] Setting ${data.data.length} trending keywords`)
          setTrending(data.data)
        } else {
          console.warn('[TrendingBanner] No trending data received:', data)
        }
      } catch (error) {
        console.error('[TrendingBanner] Error fetching trending keywords:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Don't show banner if loading or no trending data
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

