import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

const MAX_IOC_LENGTH = 1000

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(`ioc:${clientId}`, { maxRequests: 20, windowMs: 60000 })
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((limit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
          }
        }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const value = searchParams.get('value')?.trim()
    const type = searchParams.get('type')?.trim()

    if (!value || !type) {
      return NextResponse.json(
        { error: 'Missing value or type parameter' },
        { status: 400 }
      )
    }

    // Length validation
    if (value.length > MAX_IOC_LENGTH) {
      return NextResponse.json(
        { error: `IOC value too long (max ${MAX_IOC_LENGTH} characters)` },
        { status: 400 }
      )
    }

    // Type validation
    const validTypes = ['ip', 'domain', 'url', 'md5', 'sha1', 'sha256', 'cve']
    if (!validTypes.includes(type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid IOC type. Allowed: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // For now, return basic structure
    // In production, integrate with VirusTotal API (free tier: 4 requests/minute)
    // or other threat intelligence APIs
    
    const result: {
      status: string
      type: string
      value: string
      details: Record<string, unknown>
    } = {
      status: 'unknown',
      type,
      value,
      details: {}
    }

    // If VirusTotal API key is available, use it
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY
    if (vtApiKey) {
      try {
        let endpoint = ''
        if (type === 'ip') {
          endpoint = `https://www.virustotal.com/vtapi/v2/ip-address/report?apikey=${vtApiKey}&ip=${value}`
        } else if (type === 'domain') {
          endpoint = `https://www.virustotal.com/vtapi/v2/domain/report?apikey=${vtApiKey}&domain=${value}`
        } else if (type === 'url') {
          // URL needs to be submitted first, then queried
          endpoint = `https://www.virustotal.com/vtapi/v2/url/report?apikey=${vtApiKey}&resource=${encodeURIComponent(value)}`
        } else if (['md5', 'sha1', 'sha256'].includes(type)) {
          endpoint = `https://www.virustotal.com/vtapi/v2/file/report?apikey=${vtApiKey}&resource=${value}`
        }

        if (endpoint) {
          const vtResponse = await fetch(endpoint)
          if (vtResponse.ok) {
            const vtData = await vtResponse.json()
            
            if (vtData.response_code === 1) {
              const positives = vtData.positives || 0
              const total = vtData.total || 0
              
              let status = 'clean'
              if (positives === 0) {
                status = 'clean'
              } else if (positives < total / 2) {
                status = 'suspicious'
              } else {
                status = 'malicious'
              }

              result.status = status
              result.details = {
                positives,
                total,
                scan_date: vtData.scan_date,
                permalink: vtData.permalink,
                scans: vtData.scans || {},
              }
            } else {
              result.details = { message: 'Not found in VirusTotal database' }
            }
          }
        }
      } catch (error) {
        console.error('VirusTotal API error:', error)
        // Return basic result if API fails
      }
    }

    return NextResponse.json(
      result,
      {
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': limit.remaining.toString(),
          'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
        }
      }
    )
  } catch (error) {
    console.error('IOC lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

