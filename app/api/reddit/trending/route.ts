import { NextResponse } from 'next/server'
import { getTrendingKeywords } from '@/lib/reddit'

// Cache for 5 minutes
export const revalidate = 300
export const dynamic = 'force-dynamic'

/**
 * GET /api/reddit/trending
 * Get trending cybersecurity keywords from Reddit
 */
export async function GET() {
  try {
    const trending = await getTrendingKeywords(undefined, 15)

    return NextResponse.json({
      success: true,
      data: trending,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching trending keywords:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch trending keywords',
        data: [],
      },
      { status: 500 }
    )
  }
}

