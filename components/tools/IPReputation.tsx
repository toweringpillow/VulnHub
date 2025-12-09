'use client'

import { useState } from 'react'
import { MapPin, Search, Loader2 } from 'lucide-react'

export default function IPReputation() {
  const [ip, setIP] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!ip.trim()) {
      setError('Please enter an IP address')
      return
    }

    // Basic IP validation
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ip.trim())) {
      setError('Please enter a valid IP address')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`/api/tools/ip-reputation?ip=${encodeURIComponent(ip)}`)
      if (!response.ok) {
        throw new Error('IP reputation lookup failed')
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError('Failed to look up IP reputation. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getReputationColor = (reputation: string) => {
    switch (reputation?.toLowerCase()) {
      case 'clean':
      case 'safe':
        return 'text-green-400 bg-green-500/10 border-green-500/50'
      case 'suspicious':
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50'
      case 'malicious':
      case 'dangerous':
        return 'text-red-400 bg-red-500/10 border-red-500/50'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/50'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center space-x-2">
          <MapPin className="w-6 h-6 text-primary-500" />
          <span>IP Reputation Check</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Check the reputation of an IP address, including geolocation, ISP information, and threat intelligence.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            IP Address
          </label>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIP(e.target.value)}
            placeholder="192.168.1.1"
            className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
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
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Check IP</span>
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
            <div className={`p-4 rounded-lg border ${getReputationColor(result.reputation)}`}>
              <div className="text-sm font-medium mb-1">Reputation</div>
              <div className="text-2xl font-bold">{result.reputation}</div>
            </div>
          )}

          <div className="p-4 bg-dark-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">IP Information</h3>
            <div className="space-y-3">
              {Object.entries(result).map(([key, value]: [string, any]) => {
                if (key === 'reputation' || key === 'note' || key === 'message') return null
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600 last:border-0">
                    <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/3 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-200 font-mono break-all sm:w-2/3">
                      {Array.isArray(value) ? value.join(', ') : String(value || 'N/A')}
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

