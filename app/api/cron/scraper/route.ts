import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300 // 300 seconds (5 minutes) timeout for scraping multiple feeds

/**
 * Cron endpoint for RSS scraping
 * Called by external cron service (GitHub Actions, cron-job.org, etc.)
 * Protected by Authorization header with CRON_SECRET
 */
export async function POST(request: Request) {
  try {
    // Get auth header directly from request to avoid potential blocking
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    // Quick auth check - return immediately if invalid
    if (!cronSecret) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      )
    }

    const expectedAuth = `Bearer ${cronSecret}`
    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Return 202 Accepted IMMEDIATELY - before any imports or async operations
    const response = NextResponse.json(
      {
        success: true,
        message: 'Scraping started',
        timestamp: new Date().toISOString(),
      },
      { status: 202 }
    )

    // Dynamically import scrapeArticles AFTER response is prepared to avoid blocking
    // Use setImmediate to ensure response is sent first
    setImmediate(async () => {
      try {
        const { scrapeArticles } = await import('@/lib/scraper')
        const result = await scrapeArticles()
        console.log('Scrape completed successfully', {
          articlesProcessed: result.articlesProcessed,
          articlesAdded: result.articlesAdded,
          articlesSkipped: result.articlesSkipped,
        })
      } catch (error) {
        console.error('Scrape failed:', error)
      }
    })

    return response
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

