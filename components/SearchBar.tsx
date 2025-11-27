'use client'

import { useState, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    } else {
      router.push('/')
    }
  }

  const handleClear = () => {
    setQuery('')
    router.push('/')
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
      <div className="relative">
        <input
          type="search"
          id="search-query"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search threats by title, summary, or impact..."
          className="search-input pl-12 pr-24"
          aria-label="Search threats"
          autoComplete="off"
        />
        
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          <button
            type="submit"
            className="btn-primary py-1.5 px-4 text-xs"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  )
}

