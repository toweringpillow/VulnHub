import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const domain = searchParams.get('domain')
    const type = searchParams.get('type') || 'A'

    if (!domain) {
      return NextResponse.json(
        { error: 'Missing domain parameter' },
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

        return NextResponse.json({ records })
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

