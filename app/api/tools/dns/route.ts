import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

// Valid DNS record types
const VALID_DNS_TYPES = ['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'SOA']

// Domain validation regex (basic, but sufficient)
const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(`dns:${clientId}`, { maxRequests: 20, windowMs: 60000 })
    
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
    const domain = searchParams.get('domain')?.trim()
    const type = (searchParams.get('type') || 'A').toUpperCase().trim()

    // Input validation
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

    // DNS type validation
    if (!VALID_DNS_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid DNS record type. Allowed: ${VALID_DNS_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const records: any[] = []

    try {
      // Use free DNS API (cloudflare-dns.com or google dns)
      // This works better in serverless environments
      const dnsApiUrl = `https://cloudflare-dns.com/dns-query?name=${domain}&type=${type}`
      
      const response = await fetch(dnsApiUrl, {
        headers: {
          'Accept': 'application/dns-json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.Answer && data.Answer.length > 0) {
          data.Answer.forEach((record: any) => {
            records.push({
              type: type.toUpperCase(),
              name: record.name,
              value: record.data,
              ttl: record.TTL,
            })
          })
        } else if (data.Answer === undefined && type.toUpperCase() === 'MX') {
          // Try alternative approach for MX records
          try {
            const mxResponse = await fetch(`https://cloudflare-dns.com/dns-query?name=${domain}&type=MX`, {
              headers: { 'Accept': 'application/dns-json' },
            })
            if (mxResponse.ok) {
              const mxData = await mxResponse.json()
              if (mxData.Answer) {
                mxData.Answer.forEach((record: any) => {
                  const parts = record.data.split(' ')
                  records.push({
                    type: 'MX',
                    name: record.name,
                    value: `${parts[0]} ${parts.slice(1).join(' ')}`,
                    ttl: record.TTL,
                  })
                })
              }
            }
          } catch (e) {
            // Ignore
          }
        }

        if (records.length === 0) {
          return NextResponse.json(
            { error: 'No DNS records found for this domain and record type' },
            { status: 404 }
          )
        }

        return NextResponse.json(
          { records },
          {
            headers: {
              'X-RateLimit-Limit': '20',
              'X-RateLimit-Remaining': limit.remaining.toString(),
              'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
            }
          }
        )
      } else {
        throw new Error('DNS API request failed')
      }
    } catch (error: any) {
      console.error('DNS lookup error:', error)
      return NextResponse.json(
        { error: 'Failed to perform DNS lookup. Please try again.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('DNS lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

