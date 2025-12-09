'use client'

import { useState } from 'react'
import { Globe, Search, Loader2 } from 'lucide-react'

export default function WHOISLookup() {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/tools/whois?domain=${encodeURIComponent(domain)}`)
      if (!response.ok) {
        throw new Error('WHOIS lookup failed')
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to perform WHOIS lookup. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center space-x-2">
          <Globe className="w-6 h-6 text-primary-500" />
          <span>WHOIS Lookup</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Look up domain registration information including registrar, creation date, expiration date, and nameservers.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Domain Name
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
          />
        </div>

        <button
          onClick={handleLookup}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Looking up...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Lookup WHOIS</span>
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
        <div className="mt-6 p-4 bg-dark-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">WHOIS Information</h3>
          <div className="space-y-3">
            {Object.entries(result).map(([key, value]: [string, any]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600 last:border-0">
                <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/3 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className="text-sm text-gray-200 font-mono break-all sm:w-2/3">
                  {Array.isArray(value) ? value.join(', ') : String(value || 'N/A')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

