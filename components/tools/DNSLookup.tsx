'use client'

import { useState } from 'react'
import { Network, Search, Loader2 } from 'lucide-react'

interface DNSRecord {
  type: string
  name: string
  value: string
  ttl?: number
}

export default function DNSLookup() {
  const [domain, setDomain] = useState('')
  const [recordType, setRecordType] = useState('A')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<DNSRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleLookup = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch(`/api/tools/dns?domain=${encodeURIComponent(domain)}&type=${recordType}`)
      if (!response.ok) {
        throw new Error('DNS lookup failed')
      }
      const data = await response.json()
      setResults(data.records || [])
    } catch (err) {
      setError('Failed to perform DNS lookup. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center space-x-2">
          <Network className="w-6 h-6 text-primary-500" />
          <span>DNS Lookup</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Look up DNS records for any domain. Supports A, AAAA, MX, TXT, CNAME, NS, and SOA records.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Record Type
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="A">A</option>
              <option value="AAAA">AAAA</option>
              <option value="MX">MX</option>
              <option value="TXT">TXT</option>
              <option value="CNAME">CNAME</option>
              <option value="NS">NS</option>
              <option value="SOA">SOA</option>
            </select>
          </div>
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
              <span>Lookup DNS</span>
            </>
          )}
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-6 p-4 bg-dark-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">DNS Records</h3>
          <div className="space-y-3">
            {results.map((record, idx) => (
              <div key={idx} className="p-3 bg-dark-800 rounded border-l-4 border-primary-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary-400">{record.type}</span>
                  {record.ttl && (
                    <span className="text-xs text-gray-500">TTL: {record.ttl}s</span>
                  )}
                </div>
                <div className="text-sm text-gray-300">
                  <div className="font-mono break-all">{record.name}</div>
                  <div className="font-mono break-all text-gray-400 mt-1">{record.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

