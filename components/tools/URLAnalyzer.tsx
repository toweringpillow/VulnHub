'use client'

import { useState } from 'react'
import { Link as LinkIcon, Search, Loader2 } from 'lucide-react'

export default function URLAnalyzer() {
  const [url, setURL] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Basic URL validation
    let urlToCheck = url.trim()
    if (!urlToCheck.startsWith('http://') && !urlToCheck.startsWith('https://')) {
      urlToCheck = 'https://' + urlToCheck
    }

    try {
      new URL(urlToCheck)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/tools/url?url=${encodeURIComponent(urlToCheck)}`)
      if (!response.ok) {
        throw new Error('URL analysis failed')
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to analyze URL. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center space-x-2">
          <LinkIcon className="w-6 h-6 text-primary-500" />
          <span>URL Analyzer</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Analyze URLs for security threats, extract domain information, and check reputation.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setURL(e.target.value)}
            placeholder="https://example.com/path"
            className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Analyze URL</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-6 space-y-4">
          {result.reputation && (
            <div className={`p-4 rounded-lg border ${
              result.reputation === 'safe' 
                ? 'text-green-400 bg-green-500/10 border-green-500/50'
                : result.reputation === 'suspicious'
                ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50'
                : 'text-red-400 bg-red-500/10 border-red-500/50'
            }`}>
              <div className="text-sm font-medium mb-1">Reputation</div>
              <div className="text-2xl font-bold">{result.reputation}</div>
            </div>
          )}

          <div className="p-4 bg-dark-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">URL Analysis</h3>
            <div className="space-y-3">
              {Object.entries(result).map(([key, value]: [string, any]) => {
                if (key === 'reputation' || key === 'note' || key === 'message') return null
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600 last:border-0">
                    <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/3 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-200 break-all sm:w-2/3 font-mono">
                      {typeof value === 'object' ? (
                        <pre className="text-xs bg-dark-900 p-2 rounded overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        String(value || 'N/A')
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

