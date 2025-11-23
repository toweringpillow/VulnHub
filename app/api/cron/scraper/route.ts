import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { scrapeArticles } from '@/lib/scraper'

export const runtime = 'nodejs'
export const maxDuration = 120 // 120 seconds (2 minutes) timeout for scraping multiple feeds

/**
 * Cron endpoint for RSS scraping
 * Called by external cron service (GitHub Actions, cron-job.org, etc.)
 * Protected by Authorization header with CRON_SECRET
 */
export async function POST(_request: Request) {
  try {
    // Verify cron secret
    const headersList = headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }

    // Check authorization
    const expectedAuth = `Bearer ${cronSecret}`
    if (authHeader !== expectedAuth) {
      console.warn('Unauthorized cron attempt', {
        authHeaderLength: authHeader?.length ?? 0,
        expectedLength: expectedAuth.length,
        authHeaderPrefix: authHeader?.substring(0, 10) ?? 'null',
        expectedPrefix: expectedAuth.substring(0, 10),
      })
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting scheduled scrape...')
    const result = await scrapeArticles()

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cron scraper error:', error)
    return NextResponse.json(
      {
        error: 'Scraping failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'scraper',
    message: 'Use POST with Authorization header',
  })
}

