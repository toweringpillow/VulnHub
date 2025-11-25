import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { scrapeWorldNews } from '@/lib/scraper'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Cron endpoint for world news scraping
 * Called by GitHub Actions every 6 hours
 * Protected by Authorization header
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
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized cron attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting world news scrape...')
    const count = await scrapeWorldNews()

    return NextResponse.json({
      success: true,
      headlinesScraped: count,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('World news scraper error:', error)
    return NextResponse.json(
      {
        error: 'Scraping failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'world-news',
    message: 'Use POST with Authorization header',
  })
}

