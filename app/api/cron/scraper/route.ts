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

    // Import and run scraping - await to ensure it completes before function terminates
    // On serverless platforms, returning early can terminate the execution context
    console.log('Starting article scraping...')
    
    try {
      const { scrapeArticles } = await import('@/lib/scraper')
      const result = await scrapeArticles()
      
      console.log('Scrape completed successfully', {
        articlesProcessed: result.articlesProcessed,
        articlesAdded: result.articlesAdded,
        articlesSkipped: result.articlesSkipped,
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Scraping completed',
          articlesProcessed: result.articlesProcessed,
          articlesAdded: result.articlesAdded,
          articlesSkipped: result.articlesSkipped,
          errors: result.errors.length > 0 ? result.errors : undefined,
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      )
    } catch (scrapeError) {
      console.error('Scrape failed:', scrapeError)
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

