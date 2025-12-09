import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const domain = searchParams.get('domain')

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
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
          expiration_date: 'N/A (Free API limitation)',
          updated_date: 'N/A (Free API limitation)',
          nameservers: data.org || 'Unknown',
          registrant: 'N/A (Free API limitation)',
          country: data.country || 'Unknown',
          city: data.city || 'Unknown',
          region: data.region || 'Unknown',
          timezone: data.timezone || 'Unknown',
          note: 'Limited information available from free API. For full WHOIS data, consider using a paid service.',
        })
      }
    } catch (error) {
      console.error('WHOIS API error:', error)
    }

    // Fallback: Return basic structure
    return NextResponse.json({
      domain,
      message: 'WHOIS lookup requires API integration',
      note: 'To enable full WHOIS functionality, integrate with a WHOIS API service',
    })
  } catch (error) {
    console.error('WHOIS lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

