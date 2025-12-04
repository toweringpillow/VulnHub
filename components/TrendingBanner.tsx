'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'

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
        const response = await fetch('/api/reddit/trending')
        if (response.ok) {
          const data = await response.json()
          setTrending(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching trending keywords:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    // Refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || trending.length === 0) {
    return null
  }

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
