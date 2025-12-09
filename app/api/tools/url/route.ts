import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

// Blocked protocols for SSRF protection
const BLOCKED_PROTOCOLS = ['file:', 'ftp:', 'gopher:', 'javascript:', 'data:', 'vbscript:']
const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']
const MAX_URL_LENGTH = 2048

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(`url:${clientId}`, { maxRequests: 15, windowMs: 60000 })
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '15',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
          }
        }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')?.trim()

    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      )
    }

    // Length limit
    if (url.length > MAX_URL_LENGTH) {
      return NextResponse.json(
        { error: 'URL too long (max 2048 characters)' },
        { status: 400 }
      )
    }

    // Validate URL
    let urlObj: URL
    try {
      urlObj = new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // SSRF Protection - Block dangerous protocols
    if (BLOCKED_PROTOCOLS.includes(urlObj.protocol.toLowerCase())) {
      return NextResponse.json(
        { error: 'Protocol not allowed' },
        { status: 400 }
      )
    }

    // SSRF Protection - Block localhost/internal IPs
    const hostname = urlObj.hostname.toLowerCase()
    if (BLOCKED_HOSTS.includes(hostname) || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.')) {
      return NextResponse.json(
        { error: 'Internal IP addresses are not allowed' },
        { status: 400 }
      )
    }

    // Only allow http and https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return NextResponse.json(
        { error: 'Only HTTP and HTTPS URLs are allowed' },
        { status: 400 }
      )
    }

    const result: any = {
      url: url,
      domain: urlObj.hostname,
      protocol: urlObj.protocol,
      path: urlObj.pathname,
      query: urlObj.search,
      port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
    }

    // Check URL with VirusTotal if API key is available
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY
    if (vtApiKey) {
      try {
        // First, submit URL for scanning (if not already scanned)
        const submitResponse = await fetch(
          `https://www.virustotal.com/vtapi/v2/url/scan?apikey=${vtApiKey}&url=${encodeURIComponent(url)}`,
          { method: 'POST' }
        )
        
        // Then get report
        const reportResponse = await fetch(
          `https://www.virustotal.com/vtapi/v2/url/report?apikey=${vtApiKey}&resource=${encodeURIComponent(url)}`
        )
        
        if (reportResponse.ok) {
          const vtData = await reportResponse.json()
          
          if (vtData.response_code === 1) {
            const positives = vtData.positives || 0
            const total = vtData.total || 0
            
            if (positives === 0) {
              result.reputation = 'safe'
            } else if (positives < total / 2) {
              result.reputation = 'suspicious'
            } else {
              result.reputation = 'malicious'
            }
            
            result.virustotal_positives = positives
            result.virustotal_total = total
            result.virustotal_scan_date = vtData.scan_date
            result.virustotal_permalink = vtData.permalink
          }
        }
      } catch (error) {
        console.error('VirusTotal API error:', error)
      }
    } else {
      result.reputation = 'unknown'
    }

    // Extract additional URL information
    try {
      // Get DNS info for domain
      const dnsResponse = await fetch(`/api/tools/dns?domain=${urlObj.hostname}&type=A`)
      if (dnsResponse.ok) {
        const dnsData = await dnsResponse.json()
        result.dns_records = dnsData.records || []
      }
    } catch (error) {
      // Ignore DNS errors
    }

    return NextResponse.json(
      result,
      {
        headers: {
          'X-RateLimit-Limit': '15',
          'X-RateLimit-Remaining': limit.remaining.toString(),
          'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
        }
      }
    )
  } catch (error) {
    console.error('URL analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

