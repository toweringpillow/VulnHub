import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(`whois:${clientId}`, { maxRequests: 15, windowMs: 60000 })
    
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
    const domain = searchParams.get('domain')?.trim()

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
        { status: 400 }
      )
    }

    // Length limit
    if (domain.length > 253) {
      return NextResponse.json(
        { error: 'Domain name too long (max 253 characters)' },
        { status: 400 }
      )
    }

    // Domain format validation
    if (!DOMAIN_REGEX.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      )
    }

    // Use free WHOIS API (ipwhois.app or similar)
    // For production, consider using a WHOIS library or paid API
    try {
      // Using ipwhois.app free API (works for domains too)
      const response = await fetch(`https://ipwhois.app/json/${domain}`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Also try a dedicated WHOIS service
        // Note: Many free WHOIS APIs have rate limits
        return NextResponse.json({
          domain: data.domain || domain,
          registrar: data.isp || 'Unknown',
          creation_date: data.timezone || 'Unknown',
          expiration_date: 'N/A',
          updated_date: 'N/A',
          nameservers: data.org || 'Unknown',
          registrant: 'N/A',
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          timezone: data.timezone || 'Unknown',
        })
      }
    } catch (error) {
      console.error('WHOIS API error:', error)
    }

    // Fallback: Return basic structure
    return NextResponse.json({
      domain,
      registrar: 'Unknown',
      creation_date: 'Unknown',
      expiration_date: 'Unknown',
      updated_date: 'Unknown',
      nameservers: 'Unknown',
      registrant: 'Unknown',
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown',
      timezone: 'Unknown',
    },
    {
      headers: {
        'X-RateLimit-Limit': '15',
        'X-RateLimit-Remaining': limit.remaining.toString(),
        'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
      }
    })
  } catch (error) {
    console.error('WHOIS lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

