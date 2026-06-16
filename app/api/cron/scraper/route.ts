import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    const expectedAuth = `Bearer ${cronSecret}`
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting article scraping...')
    const startedAt = Date.now()

    try {
      const { scrapeArticles } = await import('@/lib/scraper')
      const result = await scrapeArticles()
      const durationMs = Date.now() - startedAt

      console.log(
        `[CRON] Scrape finished in ${durationMs}ms — added: ${result.articlesAdded}, skipped: ${result.articlesSkipped}, processed: ${result.articlesProcessed}, errors: ${result.errors.length}`
      )
      if (result.skippedReasons) {
        console.log('[CRON] Skip breakdown:', JSON.stringify(result.skippedReasons))
      }

      if (result.articlesAdded > 0 && result.newArticleIds && result.newArticleIds.length > 0) {
        try {
          const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || 'http://localhost:3000'
          const alertUrl = `${siteUrl}/api/email/send-alerts?secret=${cronSecret}&articleIds=${result.newArticleIds.join(',')}`
          fetch(alertUrl, { method: 'POST' }).catch((err) => {
            console.error('Failed to trigger email alerts:', err)
          })
        } catch (alertError) {
          console.error('Error triggering email alerts:', alertError)
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Scraping completed',
          articlesProcessed: result.articlesProcessed,
          articlesAdded: result.articlesAdded,
          articlesSkipped: result.articlesSkipped,
          skippedReasons: result.skippedReasons,
          durationMs,
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

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'scraper',
    message: 'Use POST with Authorization header',
  })
}
