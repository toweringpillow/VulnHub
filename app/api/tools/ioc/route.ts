import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const value = searchParams.get('value')
    const type = searchParams.get('type')

    if (!value || !type) {
      return NextResponse.json(
        { error: 'Missing value or type parameter' },
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
      details: {
        message: 'IOC lookup functionality requires API integration',
        note: 'To enable this feature, add VIRUSTOTAL_API_KEY to environment variables',
      }
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

    return NextResponse.json(result)
  } catch (error) {
    console.error('IOC lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

