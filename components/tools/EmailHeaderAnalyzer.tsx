'use client'

import { useState } from 'react'
import { Mail, Copy, Check } from 'lucide-react'

interface ParsedHeader {
  from?: string
  to?: string
  subject?: string
  date?: string
  returnPath?: string
  received?: Array<{
    from: string
    by: string
    with: string
    id: string
    timestamp: string
  }>
  spf?: string
  dkim?: string
  dmarc?: string
  messageId?: string
  authenticationResults?: string
  rawHeaders?: string
}

export default function EmailHeaderAnalyzer() {
  const [headerText, setHeaderText] = useState('')
  const [parsed, setParsed] = useState<ParsedHeader | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const parseEmailHeader = (text: string): ParsedHeader => {
    const lines = text.split('\n')
    const parsed: ParsedHeader = {
      received: [],
      rawHeaders: text,
    }

    let currentReceived: any = null
    let inReceived = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Handle multi-line headers (lines starting with space/tab)
      const isContinuation = /^\s/.test(line)
      
      if (isContinuation && currentReceived) {
        // Continue building current received header
        currentReceived.text += ' ' + line.trim()
        continue
      }

      // Reset continuation state
      if (!isContinuation) {
        inReceived = false
        if (currentReceived) {
          parsed.received!.push(currentReceived)
          currentReceived = null
        }
      }

      // Parse standard headers
      const match = line.match(/^([^:]+):\s*(.+)$/i)
      if (!match) continue

      const [, key, value] = match
      const keyLower = key.toLowerCase().trim()

      switch (keyLower) {
        case 'from':
          parsed.from = value
          break
        case 'to':
          parsed.to = value
          break
        case 'subject':
          parsed.subject = value
          break
        case 'date':
          parsed.date = value
          break
        case 'return-path':
          parsed.returnPath = value
          break
        case 'message-id':
          parsed.messageId = value
          break
        case 'authentication-results':
          parsed.authenticationResults = value
          break
        case 'received':
          inReceived = true
          currentReceived = {
            text: value,
            from: extractReceivedField(value, 'from'),
            by: extractReceivedField(value, 'by'),
            with: extractReceivedField(value, 'with'),
            id: extractReceivedField(value, 'id'),
            timestamp: extractReceivedField(value, /for|;|$/, true),
          }
          break
        default:
          // Check for SPF, DKIM, DMARC in various formats
          if (keyLower.includes('spf') || value.includes('spf=')) {
            parsed.spf = value
          } else if (keyLower.includes('dkim') || value.includes('dkim=')) {
            parsed.dkim = value
          } else if (keyLower.includes('dmarc') || value.includes('dmarc=')) {
            parsed.dmarc = value
          }
      }
    }

    // Add last received header if exists
    if (currentReceived) {
      parsed.received!.push(currentReceived)
    }

    return parsed
  }

  const extractReceivedField = (text: string, field: string | RegExp, isTimestamp = false): string => {
    if (isTimestamp) {
      const timestampMatch = text.match(/([A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2}[^;]*)/)
      return timestampMatch ? timestampMatch[1].trim() : ''
    }

    const pattern = typeof field === 'string' 
      ? new RegExp(`\\b${field}\\s+([^\\s;]+)`, 'i')
      : field
    const match = text.match(pattern)
    return match ? match[1] || match[0] : ''
  }

  const handleAnalyze = () => {
    setError(null)
    setCopied(false)
    
    if (!headerText.trim()) {
      setError('Please paste email headers to analyze')
      return
    }

    try {
      const result = parseEmailHeader(headerText)
      setParsed(result)
    } catch (err) {
      setError('Failed to parse email headers. Please check the format.')
      console.error(err)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getSecurityStatus = () => {
    if (!parsed) return null

    const hasSPF = !!parsed.spf
    const hasDKIM = !!parsed.dkim
    const hasDMARC = !!parsed.dmarc

    return {
      spf: hasSPF,
      dkim: hasDKIM,
      dmarc: hasDMARC,
      score: (hasSPF ? 1 : 0) + (hasDKIM ? 1 : 0) + (hasDMARC ? 1 : 0),
    }
  }

  const security = getSecurityStatus()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-2 flex items-center space-x-2">
          <Mail className="w-6 h-6 text-primary-500" />
          <span>Email Header Analyzer</span>
        </h2>
        <p className="text-gray-400 text-sm">
          Paste email headers to analyze sender information, routing path, and authentication results.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Headers (paste raw headers here)
          </label>
          <textarea
            value={headerText}
            onChange={(e) => setHeaderText(e.target.value)}
            placeholder="Paste email headers here..."
            className="w-full h-64 px-4 py-3 bg-dark-900 border border-dark-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
          />
        </div>

        <button
          onClick={handleAnalyze}
          className="w-full md:w-auto px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
        >
          Analyze Headers
        </button>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      {parsed && (
        <div className="space-y-6 mt-8">
          {/* Security Status */}
          {security && (
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Authentication Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-3 rounded ${security.spf ? 'bg-green-500/10 border border-green-500/50' : 'bg-gray-500/10 border border-gray-500/50'}`}>
                  <div className="text-sm text-gray-400">SPF</div>
                  <div className={`text-lg font-semibold ${security.spf ? 'text-green-400' : 'text-gray-500'}`}>
                    {security.spf ? '✓ Pass' : '✗ Not Found'}
                  </div>
                </div>
                <div className={`p-3 rounded ${security.dkim ? 'bg-green-500/10 border border-green-500/50' : 'bg-gray-500/10 border border-gray-500/50'}`}>
                  <div className="text-sm text-gray-400">DKIM</div>
                  <div className={`text-lg font-semibold ${security.dkim ? 'text-green-400' : 'text-gray-500'}`}>
                    {security.dkim ? '✓ Pass' : '✗ Not Found'}
                  </div>
                </div>
                <div className={`p-3 rounded ${security.dmarc ? 'bg-green-500/10 border border-green-500/50' : 'bg-gray-500/10 border border-gray-500/50'}`}>
                  <div className="text-sm text-gray-400">DMARC</div>
                  <div className={`text-lg font-semibold ${security.dmarc ? 'text-green-400' : 'text-gray-500'}`}>
                    {security.dmarc ? '✓ Pass' : '✗ Not Found'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="p-4 bg-dark-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Basic Information</h3>
            <div className="space-y-2 text-sm">
              {parsed.from && (
                <div className="flex justify-between">
                  <span className="text-gray-400">From:</span>
                  <span className="text-gray-100 font-mono">{parsed.from}</span>
                </div>
              )}
              {parsed.to && (
                <div className="flex justify-between">
                  <span className="text-gray-400">To:</span>
                  <span className="text-gray-100 font-mono">{parsed.to}</span>
                </div>
              )}
              {parsed.subject && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Subject:</span>
                  <span className="text-gray-100">{parsed.subject}</span>
                </div>
              )}
              {parsed.date && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-gray-100">{parsed.date}</span>
                </div>
              )}
              {parsed.messageId && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Message-ID:</span>
                  <span className="text-gray-100 font-mono text-xs break-all">{parsed.messageId}</span>
                </div>
              )}
              {parsed.returnPath && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Return-Path:</span>
                  <span className="text-gray-100 font-mono">{parsed.returnPath}</span>
                </div>
              )}
            </div>
          </div>

          {/* Received Headers (Routing Path) */}
          {parsed.received && parsed.received.length > 0 && (
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Routing Path</h3>
              <div className="space-y-3">
                {parsed.received.map((rec, idx) => (
                  <div key={idx} className="p-3 bg-dark-800 rounded border-l-4 border-primary-500">
                    <div className="text-xs text-gray-400 mb-2">Hop {parsed.received!.length - idx}</div>
                    <div className="space-y-1 text-sm">
                      {rec.from && (
                        <div><span className="text-gray-400">From:</span> <span className="text-gray-100 font-mono">{rec.from}</span></div>
                      )}
                      {rec.by && (
                        <div><span className="text-gray-400">By:</span> <span className="text-gray-100 font-mono">{rec.by}</span></div>
                      )}
                      {rec.with && (
                        <div><span className="text-gray-400">With:</span> <span className="text-gray-100">{rec.with}</span></div>
                      )}
                      {rec.timestamp && (
                        <div><span className="text-gray-400">Time:</span> <span className="text-gray-100">{rec.timestamp}</span></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Authentication Results */}
          {parsed.authenticationResults && (
            <div className="p-4 bg-dark-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Authentication Results</h3>
              <pre className="text-xs text-gray-300 font-mono bg-dark-900 p-3 rounded overflow-x-auto">
                {parsed.authenticationResults}
              </pre>
            </div>
          )}

          {/* Raw Headers */}
          <div className="p-4 bg-dark-700 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-100">Raw Headers</h3>
              <button
                onClick={() => copyToClipboard(parsed.rawHeaders || '')}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-dark-800 hover:bg-dark-600 rounded text-gray-300"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-xs text-gray-300 font-mono bg-dark-900 p-3 rounded overflow-x-auto max-h-96 overflow-y-auto">
              {parsed.rawHeaders}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

