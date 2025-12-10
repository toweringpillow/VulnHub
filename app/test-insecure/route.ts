/**
 * INTENTIONALLY INSECURE API ENDPOINT
 * Exposes API information for EASM testing
 */

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const isEnabled = process.env.ENABLE_INSECURE_TEST === 'true'
  
  if (!isEnabled) {
    return NextResponse.json({ error: 'Test environment disabled' }, { status: 403 })
  }

  const headersList = await headers()
  
  // Intentionally expose API information
  const apiInfo = {
    status: 'active',
    version: '1.0.0-test',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/test-insecure',
      '/test-insecure/debug',
      '/test-insecure/env',
      '/test-insecure/headers',
      '/test-insecure/error',
    ],
    security: {
      authentication: 'none',
      rateLimiting: 'disabled',
      cors: 'permissive',
    },
    headers: {
      host: headersList.get('host'),
      userAgent: headersList.get('user-agent'),
    },
  }

  return NextResponse.json(apiInfo, {
    headers: {
      // Intentionally missing security headers
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  })
}

