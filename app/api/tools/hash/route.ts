import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(`hash:${clientId}`, { maxRequests: 20, windowMs: 60000 })
    
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
    const hash = searchParams.get('hash')?.trim()
    const type = searchParams.get('type')?.trim()

    if (!hash || !type) {
      return NextResponse.json(
        { error: 'Missing hash or type parameter' },
        { status: 400 }
      )
    }

    // Length validation
    if (hash.length > 64) {
      return NextResponse.json(
        { error: 'Hash too long (max 64 characters for SHA256)' },
        { status: 400 }
      )
    }

    // Type validation
    const validTypes = ['MD5', 'SHA1', 'SHA256']
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid hash type. Allowed: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate hash format and length based on type
    const hashRegex = /^[a-f0-9]+$/i
    if (!hashRegex.test(hash)) {
      return NextResponse.json(
        { error: 'Invalid hash format (must be hexadecimal)' },
        { status: 400 }
      )
    }

    // Validate hash length matches type
    const expectedLengths: Record<string, number> = {
      'MD5': 32,
      'SHA1': 40,
      'SHA256': 64,
    }
    const expectedLength = expectedLengths[type.toUpperCase()]
    if (hash.length !== expectedLength) {
      return NextResponse.json(
        { error: `${type} hash must be exactly ${expectedLength} characters` },
        { status: 400 }
      )
    }

    const result: any = {
      hash,
      type,
      status: 'unknown',
    }

    // Use VirusTotal API if available (free tier: 4 requests/minute)
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY
    if (vtApiKey) {
      try {
        const vtResponse = await fetch(
          `https://www.virustotal.com/vtapi/v2/file/report?apikey=${vtApiKey}&resource=${hash}`
        )
        
        if (vtResponse.ok) {
          const vtData = await vtResponse.json()
          
          if (vtData.response_code === 1) {
            const positives = vtData.positives || 0
            const total = vtData.total || 0
            
            if (positives === 0) {
              result.status = 'clean'
            } else if (positives < total / 2) {
              result.status = 'suspicious'
            } else {
              result.status = 'malicious'
            }
            
            result.positives = positives
            result.total = total
            result.scan_date = vtData.scan_date
            result.permalink = vtData.permalink
            result.sha256 = vtData.sha256
            result.md5 = vtData.md5
            result.sha1 = vtData.sha1
            result.scans = vtData.scans || {}
          } else {
            result.status = 'not_found'
            result.message = 'Hash not found in VirusTotal database'
          }
        }
      } catch (error) {
        console.error('VirusTotal API error:', error)
        result.message = 'VirusTotal API error'
      }
    } else {
      result.status = 'unknown'
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
    console.error('Hash lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

