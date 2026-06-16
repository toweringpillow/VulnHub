import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import {
  checkAndAlertStaleFeed,
  getFeedHealth,
  getRecentScrapeStats,
} from '@/lib/monitoring'

export const runtime = 'nodejs'
export const maxDuration = 30

function verifyCronAuth(): NextResponse | null {
  const headersList = headers()
  const authHeader = headersList.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized health-check attempt')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return null
}

/**
 * Daily health check — verifies articles are being added and sends alerts if stale.
 * Called by GitHub Actions once per day.
 */
export async function POST() {
  const authError = verifyCronAuth()
  if (authError) return authError

  try {
    console.log('Running feed health check...')
    const health = await checkAndAlertStaleFeed('daily-health-check')
    const scrapeStats = await getRecentScrapeStats(24)

    return NextResponse.json({
      success: true,
      health,
      scrapeStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  const authError = verifyCronAuth()
  if (authError) return authError

  try {
    const health = await getFeedHealth()
    const scrapeStats = await getRecentScrapeStats(24)

    return NextResponse.json({
      status: health.isStale ? 'stale' : 'healthy',
      health,
      scrapeStats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
