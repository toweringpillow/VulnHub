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
    const trending = await getTrendingKeywords(undefined, 15)
    
    console.log(`Found ${trending.length} trending keywords`)

    return NextResponse.json({
      success: true,
      data: trending,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching trending keywords:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        data: [],
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

