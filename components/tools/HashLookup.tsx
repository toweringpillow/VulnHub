'use client'

import { useState } from 'react'
import { Hash, Search, Loader2, Copy, Check, ExternalLink, AlertTriangle, Shield, ShieldAlert } from 'lucide-react'

export default function HashLookup() {
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  const detectHashType = (hash: string): string => {
    const trimmed = hash.trim()
    if (/^[a-f0-9]{32}$/i.test(trimmed)) return 'MD5'
    if (/^[a-f0-9]{40}$/i.test(trimmed)) return 'SHA1'
    if (/^[a-f0-9]{64}$/i.test(trimmed)) return 'SHA256'
    return 'Unknown'
  }

  const copyToClipboard = async (text: string, hashType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedHash(hashType)
      setTimeout(() => setCopiedHash(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
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
        return <Shield className="w-5 h-5" />
      case 'suspicious':
        return <ShieldAlert className="w-5 h-5" />
      case 'malicious':
        return <AlertTriangle className="w-5 h-5" />
      default:
        return null
    }
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
        <div className="mt-6 space-y-4">
          {/* Status Summary */}
          {result.status && result.status !== 'unknown' && (
            <div className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">Status</div>
                  <div className="text-2xl font-bold capitalize">{result.status}</div>
                  {result.positives !== undefined && result.total !== undefined && (
                    <div className="text-xs mt-1 opacity-75">
                      {result.positives} of {result.total} engines detected threats
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-dark-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Hash Information</h3>
            <div className="space-y-3">
              {/* Hash Values */}
              {result.sha256 && (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600">
                  <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/4">SHA256</span>
                  <div className="flex items-center space-x-2 sm:w-3/4">
                    <code className="text-sm text-gray-200 font-mono break-all">{result.sha256}</code>
                    <button
                      onClick={() => copyToClipboard(result.sha256, 'sha256')}
                      className="flex-shrink-0 p-1 hover:bg-dark-600 rounded transition-colors"
                      title="Copy SHA256"
                    >
                      {copiedHash === 'sha256' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {result.sha1 && (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600">
                  <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/4">SHA1</span>
                  <div className="flex items-center space-x-2 sm:w-3/4">
                    <code className="text-sm text-gray-200 font-mono break-all">{result.sha1}</code>
                    <button
                      onClick={() => copyToClipboard(result.sha1, 'sha1')}
                      className="flex-shrink-0 p-1 hover:bg-dark-600 rounded transition-colors"
                      title="Copy SHA1"
                    >
                      {copiedHash === 'sha1' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              {result.md5 && (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600">
                  <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/4">MD5</span>
                  <div className="flex items-center space-x-2 sm:w-3/4">
                    <code className="text-sm text-gray-200 font-mono break-all">{result.md5}</code>
                    <button
                      onClick={() => copyToClipboard(result.md5, 'md5')}
                      className="flex-shrink-0 p-1 hover:bg-dark-600 rounded transition-colors"
                      title="Copy MD5"
                    >
                      {copiedHash === 'md5' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Scan Date */}
              {result.scan_date && (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600">
                  <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/4">Scan Date</span>
                  <span className="text-sm text-gray-200 sm:w-3/4">{result.scan_date}</span>
                </div>
              )}

              {/* Permalink */}
              {result.permalink && (
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600">
                  <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/4">VirusTotal Report</span>
                  <a
                    href={result.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-400 hover:text-primary-300 flex items-center space-x-1 sm:w-3/4"
                  >
                    <span className="break-all">View on VirusTotal</span>
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  </a>
                </div>
              )}

              {/* Scans Table */}
              {result.scans && typeof result.scans === 'object' && Object.keys(result.scans).length > 0 && (
                <div className="pt-2 border-t border-dark-600">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Antivirus Scan Results</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-dark-600">
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Engine</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Detected</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Result</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Version</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(result.scans)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([engine, scanData]: [string, any]) => (
                            <tr key={engine} className="border-b border-dark-600/50 hover:bg-dark-600/30">
                              <td className="py-2 px-3 text-gray-200 font-medium">{engine}</td>
                              <td className="py-2 px-3">
                                {scanData.detected ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/50">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/50">
                                    No
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-gray-300 font-mono text-xs">
                                {scanData.result || <span className="text-gray-500">-</span>}
                              </td>
                              <td className="py-2 px-3 text-gray-400 text-xs">{scanData.version || '-'}</td>
                              <td className="py-2 px-3 text-gray-400 text-xs">{scanData.update || '-'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Other fields */}
              {Object.entries(result).map(([key, value]: [string, any]) => {
                // Skip fields we've already displayed
                if (['note', 'message', 'status', 'positives', 'total', 'scan_date', 'permalink', 'sha256', 'md5', 'sha1', 'scans', 'hash', 'type'].includes(key)) return null
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-2 border-b border-dark-600 last:border-0">
                    <span className="text-sm font-medium text-gray-400 mb-1 sm:mb-0 sm:w-1/4 capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="text-sm text-gray-200 break-all sm:w-3/4">
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
        </div>
      )}
    </div>
  )
}

