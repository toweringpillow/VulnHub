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
    })
  } catch (error) {
    console.error('WHOIS lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

