import { NextResponse } from 'next/server'
import { getTrendingKeywords } from '@/lib/reddit'
import { createServerClient } from '@/lib/supabase/server'

// Cache for 5 minutes
export const revalidate = 300
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Allow up to 30 seconds for Reddit API calls

/**
 * Fallback: Get trending tags from database (most used tags in recent articles)
 */
async function getTrendingTagsFromDatabase(limit: number = 10) {
  try {
    const supabase = createServerClient()
    
    // Get most popular tags from articles published in the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // First, get recent article IDs
    const { data: recentArticles, error: articlesError } = await supabase
      .from('articles')
      .select('id')
      .gte('published_date', sevenDaysAgo.toISOString())
      .limit(500)
    
    if (articlesError || !recentArticles || recentArticles.length === 0) {
      console.log('No recent articles found for trending tags')
      return []
    }
    
    const articleIds = recentArticles.map(a => a.id)
    
    // Get all tags for these articles
    const { data: articleTags, error: tagsError } = await supabase
      .from('article_tags')
      .select(`
        tag_id,
        tags (
          id,
          name
        )
      `)
      .in('article_id', articleIds)
    
    if (tagsError || !articleTags) {
      console.error('Error fetching article tags:', tagsError)
      return []
    }
    
    // Count tag occurrences
    const tagCounts = new Map<string, { count: number; name: string }>()
    
    for (const item of articleTags) {
      const tag = (item as any).tags
      if (tag && tag.name) {
        const current = tagCounts.get(tag.name) || { count: 0, name: tag.name }
        tagCounts.set(tag.name, { count: current.count + 1, name: tag.name })
      }
    }
    
    // Convert to array and sort by count
    const trending = Array.from(tagCounts.entries())
      .map(([name, info]) => ({
        keyword: name,
        score: info.count,
        count: info.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
    
    return trending
  } catch (error) {
    console.error('Error in getTrendingTagsFromDatabase:', error)
    return []
  }
}

/**
 * GET /api/reddit/trending
 * Get trending cybersecurity keywords from Reddit, with fallback to database tags
 */
export async function GET() {
  try {
    console.log('Fetching trending keywords from Reddit...')
    const startTime = Date.now()
    const trending = await getTrendingKeywords(undefined, 15)
    const duration = Date.now() - startTime
    
    console.log(`Found ${trending.length} trending keywords from Reddit in ${duration}ms`)
    
    // If Reddit returns no results, fallback to database tags
    if (trending.length === 0) {
      console.log('Reddit returned no results, falling back to database tags...')
      const dbStartTime = Date.now()
      const dbTrending = await getTrendingTagsFromDatabase(15)
      const dbDuration = Date.now() - dbStartTime
      
      console.log(`Found ${dbTrending.length} trending tags from database in ${dbDuration}ms`)
      
      if (dbTrending.length > 0) {
        console.log('Top database tags:', dbTrending.slice(0, 5).map(t => t.keyword).join(', '))
      }
      
      return NextResponse.json({
        success: true,
        data: dbTrending,
        count: dbTrending.length,
        source: 'database',
        timestamp: new Date().toISOString(),
        duration: `${dbDuration}ms`,
      })
    }
    
    if (trending.length > 0) {
      console.log('Top Reddit keywords:', trending.slice(0, 5).map(t => t.keyword).join(', '))
    }

    return NextResponse.json({
      success: true,
      data: trending,
      count: trending.length,
      source: 'reddit',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
    })
  } catch (error) {
    console.error('Error fetching trending keywords:', error)
    
    // Try database fallback even on error
    try {
      console.log('Attempting database fallback after error...')
      const dbTrending = await getTrendingTagsFromDatabase(15)
      if (dbTrending.length > 0) {
        return NextResponse.json({
          success: true,
          data: dbTrending,
          count: dbTrending.length,
          source: 'database',
          timestamp: new Date().toISOString(),
        })
      }
    } catch (fallbackError) {
      console.error('Database fallback also failed:', fallbackError)
    }
    
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

