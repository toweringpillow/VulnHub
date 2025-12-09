import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const hash = searchParams.get('hash')
    const type = searchParams.get('type')

    if (!hash || !type) {
      return NextResponse.json(
        { error: 'Missing hash or type parameter' },
        { status: 400 }
      )
    }

    // Validate hash format
    const hashRegex = /^[a-f0-9]+$/i
    if (!hashRegex.test(hash)) {
      return NextResponse.json(
        { error: 'Invalid hash format' },
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
      result.message = 'VirusTotal API key not configured. Add VIRUSTOTAL_API_KEY to enable hash lookup.'
      result.note = 'Get a free API key at https://www.virustotal.com/gui/join-us'
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Hash lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

