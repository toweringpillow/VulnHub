import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { scrapeArticles } from '@/lib/scraper'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout

/**
 * Cron endpoint for RSS scraping
 * Called by Vercel Cron every 15 minutes
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

