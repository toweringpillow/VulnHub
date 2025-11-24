'use client'

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface WorldNewsItem {
  id: number
  title: string
  link: string
  source: string | null
  created_at: string
}

export default function WorldNewsSidebar() {
  const [news, setNews] = useState<WorldNewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWorldNews() {
      try {
        const response = await fetch('/api/world-news')
        if (response.ok) {
          const data = await response.json()
          setNews(data.slice(0, 10)) // Limit to 10 items
        }
      } catch (error) {
        console.error('Error fetching world news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorldNews()
    // Refresh every 5 minutes
    const interval = setInterval(fetchWorldNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="hidden lg:block w-full lg:w-1/3 lg:pl-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 sticky top-24">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">World News</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-dark-700 rounded mb-2"></div>
                <div className="h-3 bg-dark-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (news.length === 0) {
    return null
  }

  return (
    <div className="hidden lg:block w-full lg:w-1/3 lg:pl-6">
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center justify-between">
          <span>World News</span>
          <span className="text-xs text-gray-500 font-normal">Live Updates</span>
        </h3>
        <div className="space-y-4">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group hover:bg-dark-700/50 rounded-lg p-3 transition-colors border border-transparent hover:border-dark-600"
            >
              <h4 className="text-sm font-medium text-gray-200 group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
                {item.title}
              </h4>
              {item.source && (
                <p className="text-xs text-gray-400 mb-1.5">{item.source}</p>
              )}
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">Read more</span>
                <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-primary-400 transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

