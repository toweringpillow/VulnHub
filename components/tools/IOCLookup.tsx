'use client'

import { useState } from 'react'
import { ShieldAlert, Search, Loader2, ExternalLink } from 'lucide-react'

interface IOCResult {
  type: string
  value: string
  status: 'clean' | 'suspicious' | 'malicious' | 'unknown'
  details?: any
}

export default function IOCLookup() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<IOCResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const detectIOCType = (value: string): string => {
    const trimmed = value.trim()
    
    // Hash detection (MD5, SHA1, SHA256)
    if (/^[a-f0-9]{32}$/i.test(trimmed)) return 'md5'
    if (/^[a-f0-9]{40}$/i.test(trimmed)) return 'sha1'
    if (/^[a-f0-9]{64}$/i.test(trimmed)) return 'sha256'
    
    // IP address
    if (/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(trimmed)) {
      return 'ip'
    }
    
    // Domain/URL
    if (/^https?:\/\//i.test(trimmed)) return 'url'
    if (/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/i.test(trimmed)) {
      return 'domain'
    }
    
    // CVE
    if (/^CVE-\d{4}-\d+$/i.test(trimmed)) return 'cve'
    
    return 'unknown'
  }

  const lookupIOC = async (value: string, type: string) => {
    try {
      const response = await fetch(`/api/tools/ioc?value=${encodeURIComponent(value)}&type=${type}`)
      if (!response.ok) {
        throw new Error('Lookup failed')
      }
      return await response.json()
    } catch (err) {
      console.error('IOC lookup error:', err)
      return { status: 'unknown', details: null }
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter an IOC to look up')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      // Support multiple IOCs (one per line)
      const iocs = query.split('\n').map(q => q.trim()).filter(q => q)
      const results: IOCResult[] = []

      for (const ioc of iocs) {
        const type = detectIOCType(ioc)
        if (type === 'unknown') {
          results.push({
            type: 'unknown',
            value: ioc,
            status: 'unknown',
            details: { message: 'Could not determine IOC type' }
          })
          continue
        }

        const result = await lookupIOC(ioc, type)
        results.push({
          type,
          value: ioc,
          status: result.status || 'unknown',
          details: result.details || result
        })
      }

      setResults(results)
    } catch (err) {
      setError('Failed to look up IOCs. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clean':
        return 'text-green-400 bg-green-500/10 border-green-500/50'
      case 'suspicious':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50'
      case 'malicious':
        return 'text-red-400 bg-red-500/10 border-red-500/50'
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return '✓'
      case 'suspicious':
        return '⚠'
      case 'malicious':
        return '✗'
      default:
        return '?'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-primary-500" />
          <span>IOC Lookup</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Look up Indicators of Compromise (IOCs) including file hashes, IP addresses, domains, URLs, and CVEs.
          Supports multiple IOCs (one per line).
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Enter IOC(s) - one per line
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Example:&#10;192.168.1.1&#10;example.com&#10;https://malicious-site.com/path&#10;5d41402abc4b2a76b9719d911017c592&#10;CVE-2024-1234"
            className="w-full h-32 px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        <button
          onClick={handleSearch}
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
              <span>Lookup IOC(s)</span>
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
        <div className="space-y-4 mt-6">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg font-bold">{getStatusIcon(result.status)}</span>
                    <span className="text-sm font-medium uppercase">{result.type}</span>
                    <span className="text-xs px-2 py-1 rounded bg-dark-900/50">
                      {result.status}
                    </span>
                  </div>
                  <div className="font-mono text-sm text-gray-200 break-all">
                    {result.value}
                  </div>
                </div>
              </div>

              {result.details && Object.keys(result.details).length > 0 && (
                <div className="mt-3 pt-3 border-t border-current/20">
                  {/* CVE-specific formatting */}
                  {result.type === 'cve' && result.details.id && (
                    <div className="space-y-3">
                      {/* CVE Summary Card */}
                      {result.details.cvssScore !== null && result.details.cvssScore !== undefined && (
                        <div className="p-3 bg-dark-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-400">CVSS Score</span>
                            <span className={`text-lg font-bold ${
                              result.details.severity === 'CRITICAL' || result.details.severity === 'HIGH'
                                ? 'text-red-400'
                                : result.details.severity === 'MEDIUM'
                                ? 'text-yellow-400'
                                : 'text-green-400'
                            }`}>
                              {result.details.cvssScore} {result.details.cvssVersion ? `(v${result.details.cvssVersion})` : ''}
                            </span>
                          </div>
                          {result.details.severity && (
                            <div className="text-xs text-gray-400">
                              Severity: <span className="font-medium text-gray-300">{result.details.severity}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {result.details.description && (
                        <div>
                          <div className="text-xs font-medium text-gray-400 mb-1">Description</div>
                          <div className="text-sm text-gray-300">{result.details.description}</div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {result.details.published && (
                          <div>
                            <div className="text-gray-400 mb-1">Published</div>
                            <div className="text-gray-300">{new Date(result.details.published as string).toLocaleDateString()}</div>
                          </div>
                        )}
                        {result.details.lastModified && (
                          <div>
                            <div className="text-gray-400 mb-1">Last Modified</div>
                            <div className="text-gray-300">{new Date(result.details.lastModified as string).toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>

                      {/* NVD Link */}
                      {result.details.nvdUrl && (
                        <div>
                          <a
                            href={result.details.nvdUrl as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300"
                          >
                            <span>View on NVD</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {/* References */}
                      {result.details.references && Array.isArray(result.details.references) && result.details.references.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-gray-400 mb-2">
                            References ({result.details.references.length})
                          </div>
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {(result.details.references as any[]).slice(0, 5).map((ref: any, refIdx: number) => (
                              <a
                                key={refIdx}
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-primary-400 hover:text-primary-300 truncate"
                              >
                                {ref.url}
                              </a>
                            ))}
                            {(result.details.references as any[]).length > 5 && (
                              <div className="text-xs text-gray-500">
                                +{(result.details.references as any[]).length - 5} more references
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Non-CVE details (fallback to JSON for other types) */}
                  {result.type !== 'cve' && (
                    <pre className="text-xs text-gray-300 font-mono bg-dark-900/50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

