import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ip = searchParams.get('ip')

    if (!ip) {
      return NextResponse.json(
        { error: 'Missing IP parameter' },
        { status: 400 }
      )
    }

    // Validate IP format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(ip)) {
      return NextResponse.json(
        { error: 'Invalid IP address format' },
        { status: 400 }
      )
    }

    // Use free IP geolocation and reputation APIs
    const results: any = {}

    try {
      // Get geolocation and basic info
      const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`)
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        results.ip = geoData.ip || ip
        results.country = geoData.country_name || 'Unknown'
        results.region = geoData.region || 'Unknown'
        results.city = geoData.city || 'Unknown'
        results.isp = geoData.org || 'Unknown'
        results.timezone = geoData.timezone || 'Unknown'
        results.latitude = geoData.latitude
        results.longitude = geoData.longitude
      }
    } catch (error) {
      console.error('IP geolocation error:', error)
    }

    // Check reputation with VirusTotal if API key is available
    const vtApiKey = process.env.VIRUSTOTAL_API_KEY
    if (vtApiKey) {
      try {
        const vtResponse = await fetch(
          `https://www.virustotal.com/vtapi/v2/ip-address/report?apikey=${vtApiKey}&ip=${ip}`
        )
        if (vtResponse.ok) {
          const vtData = await vtResponse.json()
          if (vtData.response_code === 1) {
            const positives = vtData.positives || 0
            const total = vtData.total || 0
            
            if (positives === 0) {
              results.reputation = 'clean'
            } else if (positives < total / 2) {
              results.reputation = 'suspicious'
            } else {
              results.reputation = 'malicious'
            }
            
            results.virustotal_positives = positives
            results.virustotal_total = total
            results.virustotal_scan_date = vtData.scan_date
          }
        }
      } catch (error) {
        console.error('VirusTotal API error:', error)
      }
    } else {
      results.reputation = 'unknown'
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('IP reputation lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

