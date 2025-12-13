import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit'

const MAX_IOC_LENGTH = 1000

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request)
    const limit = rateLimit(`ioc:${clientId}`, { maxRequests: 20, windowMs: 60000 })
    
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
    const value = searchParams.get('value')?.trim()
    const type = searchParams.get('type')?.trim()

    if (!value || !type) {
      return NextResponse.json(
        { error: 'Missing value or type parameter' },
        { status: 400 }
      )
    }

    // Length validation
    if (value.length > MAX_IOC_LENGTH) {
      return NextResponse.json(
        { error: `IOC value too long (max ${MAX_IOC_LENGTH} characters)` },
        { status: 400 }
      )
    }

    // Type validation
    const validTypes = ['ip', 'domain', 'url', 'md5', 'sha1', 'sha256', 'cve']
    if (!validTypes.includes(type.toLowerCase())) {
      return NextResponse.json(
        { error: `Invalid IOC type. Allowed: ${validTypes.join(', ')}` },
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
      details: {}
    }

    const vtApiKey = process.env.VIRUSTOTAL_API_KEY

    // Handle CVE lookups using NVD API (free, no API key required)
    if (type === 'cve') {
      try {
        // Validate CVE format
        const cveRegex = /^CVE-\d{4}-\d+$/i
        if (!cveRegex.test(value)) {
          return NextResponse.json(
            { error: 'Invalid CVE format. Expected format: CVE-YYYY-NNNN' },
            { status: 400 }
          )
        }

        // NVD API v2.0 endpoint
        const nvdUrl = `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(value.toUpperCase())}`
        const nvdResponse = await fetch(nvdUrl, {
          headers: {
            'Accept': 'application/json',
          }
        })

        if (nvdResponse.ok) {
          const nvdData = await nvdResponse.json()
          
          if (nvdData.vulnerabilities && nvdData.vulnerabilities.length > 0) {
            const cve = nvdData.vulnerabilities[0].cve
            
            // Determine status based on CVSS score
            let status = 'unknown'
            let cvssScore = null
            let severity = null
            
            if (cve.metrics?.cvssMetricV31 && cve.metrics.cvssMetricV31.length > 0) {
              cvssScore = cve.metrics.cvssMetricV31[0].cvssData.baseScore
              severity = cve.metrics.cvssMetricV31[0].cvssData.baseSeverity
            } else if (cve.metrics?.cvssMetricV30 && cve.metrics.cvssMetricV30.length > 0) {
              cvssScore = cve.metrics.cvssMetricV30[0].cvssData.baseScore
              severity = cve.metrics.cvssMetricV30[0].cvssData.baseSeverity
            } else if (cve.metrics?.cvssMetricV2 && cve.metrics.cvssMetricV2.length > 0) {
              cvssScore = cve.metrics.cvssMetricV2[0].cvssData.baseScore
              severity = cve.metrics.cvssMetricV2[0].baseSeverity
            }

            // Map severity to status
            if (severity) {
              if (['CRITICAL', 'HIGH'].includes(severity.toUpperCase())) {
                status = 'malicious'
              } else if (['MEDIUM'].includes(severity.toUpperCase())) {
                status = 'suspicious'
              } else {
                status = 'clean'
              }
            }

            result.status = status
            result.details = {
              id: cve.id,
              published: cve.published,
              lastModified: cve.lastModified,
              description: cve.descriptions?.find((d: any) => d.lang === 'en')?.value || 'No description available',
              cvssScore,
              severity,
              cvssVersion: cve.metrics?.cvssMetricV31 ? '3.1' : cve.metrics?.cvssMetricV30 ? '3.0' : cve.metrics?.cvssMetricV2 ? '2.0' : null,
              references: cve.references?.map((ref: any) => ({
                url: ref.url,
                source: ref.source,
                tags: ref.tags || []
              })) || [],
              configurations: cve.configurations || [],
              nvdUrl: `https://nvd.nist.gov/vuln/detail/${cve.id}`,
            }
          } else {
            result.details = { message: 'CVE not found in NVD database' }
          }
        } else {
          result.details = { message: 'Failed to query NVD API' }
        }
      } catch (error) {
        console.error('NVD API error:', error)
        result.details = { message: 'Error querying CVE database' }
      }
    }
    // If VirusTotal API key is available, use it for other IOC types
    else if (vtApiKey) {
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
    console.error('IOC lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

