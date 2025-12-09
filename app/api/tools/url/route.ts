import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
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
      result.note = 'VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY for reputation checking.'
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

    return NextResponse.json(result)
  } catch (error) {
    console.error('URL analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

