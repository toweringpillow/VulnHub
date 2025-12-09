'use client'

import { useState } from 'react'
import { Hash, Search, Loader2 } from 'lucide-react'

export default function HashLookup() {
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const detectHashType = (hash: string): string => {
    const trimmed = hash.trim()
    if (/^[a-f0-9]{32}$/i.test(trimmed)) return 'MD5'
    if (/^[a-f0-9]{40}$/i.test(trimmed)) return 'SHA1'
    if (/^[a-f0-9]{64}$/i.test(trimmed)) return 'SHA256'
    return 'Unknown'
  }

  const handleLookup = async () => {
    if (!hash.trim()) {
      setError('Please enter a hash')
      return
    }

    const hashType = detectHashType(hash)
    if (hashType === 'Unknown') {
      setError('Invalid hash format. Supported: MD5 (32 chars), SHA1 (40 chars), SHA256 (64 chars)')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/tools/hash?hash=${encodeURIComponent(hash)}&type=${hashType}`)
      if (!response.ok) {
        throw new Error('Hash lookup failed')
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to look up hash. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center space-x-2">
          <Hash className="w-6 h-6 text-primary-500" />
          <span>Hash Lookup</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Look up file hashes (MD5, SHA1, SHA256) against threat intelligence databases.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hash (MD5, SHA1, or SHA256)
          </label>
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="5d41402abc4b2a76b9719d911017c592"
            className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
            onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
          />
          {hash && (
            <div className="mt-2 text-xs text-gray-500">
              Detected: {detectHashType(hash)}
            </div>
          )}
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
              <span>Lookup Hash</span>
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
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Hash Analysis</h3>
          <div className="space-y-3">
            {Object.entries(result).map(([key, value]: [string, any]) => {
              // Filter out note and message fields
              if (key === 'note' || key === 'message') return null
              return (
                <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600 last:border-0">
                  <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/3 capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-200 break-all sm:w-2/3">
                    {typeof value === 'object' ? (
                      <pre className="text-xs font-mono bg-dark-900 p-2 rounded overflow-x-auto">
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
      )}
    </div>
  )
}

