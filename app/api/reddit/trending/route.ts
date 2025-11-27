import { NextResponse } from 'next/server'
import { getTrendingKeywords } from '@/lib/reddit'

// Cache for 5 minutes
export const revalidate = 300
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Allow up to 30 seconds for Reddit API calls

/**
 * GET /api/reddit/trending
 * Get trending cybersecurity keywords from Reddit
 */
export async function GET() {
  try {
    console.log('Fetching trending keywords from Reddit...')
    const startTime = Date.now()
    const trending = await getTrendingKeywords(undefined, 15)
    const duration = Date.now() - startTime
    
    console.log(`Found ${trending.length} trending keywords in ${duration}ms`)
    if (trending.length > 0) {
      console.log('Top keywords:', trending.slice(0, 5).map(t => t.keyword).join(', '))
    }

    return NextResponse.json({
      success: true,
      data: trending,
      count: trending.length,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
    })
  } catch (error) {
    console.error('Error fetching trending keywords:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
        data: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

