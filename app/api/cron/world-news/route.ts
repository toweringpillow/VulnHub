import { NextResponse } from 'next/server'
import { scrapeWorldNews } from '@/lib/scraper'

export const runtime = 'nodejs'
export const maxDuration = 300 // 300 seconds (5 minutes) - matches project default

/**
 * Cron endpoint for world news scraping
 * Called by GitHub Actions every 6 hours
 * Protected by Authorization header
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret - get auth header directly from request to avoid potential blocking
    const authHeader = request.headers.get('authorization')
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
    
    // Await scraping to ensure it completes before function terminates
    // On serverless platforms, returning early can terminate the execution context
    try {
      const count = await scrapeWorldNews()
      
      console.log('World news scrape completed', {
        headlinesScraped: count,
      })

      return NextResponse.json(
        {
          success: true,
          message: 'World news scraping completed',
          headlinesScraped: count,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      )
    } catch (scrapeError) {
      console.error('World news scrape error:', scrapeError)
      return NextResponse.json(
        {
          success: false,
          error: 'Scraping failed',
          message: scrapeError instanceof Error ? scrapeError.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
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

