import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

// Mark as dynamic route
export const dynamic = 'force-dynamic'

/**
 * GET /api/articles
 * Fetch articles with pagination and optional filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Math.min(100, parseInt(searchParams.get('page') || '1'))) // Max 100 pages
    const perPage = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('perPage') || String(DEFAULT_PAGE_SIZE)))
    )
    const query = searchParams.get('q')?.trim().slice(0, 200) // Max 200 chars
    const tagId = searchParams.get('tag')
    const source = searchParams.get('source')?.trim().slice(0, 100) // Max 100 chars
    const inWild = searchParams.get('inWild')

    const supabase = createServerClient()
    
    // Build query
    let dbQuery = supabase
      .from('articles')
      .select(`
        *,
        article_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `, { count: 'exact' })
      .order('published_date', { ascending: false })

    // Apply filters
    if (query && query.length >= 2) { // Minimum 2 characters for search
      // Escape special characters for Supabase ilike
      const escapedQuery = query.replace(/[%_\\]/g, '\\$&')
      dbQuery = dbQuery.or(`title.ilike.%${escapedQuery}%,ai_summary.ilike.%${escapedQuery}%`)
    }

    if (source) {
      dbQuery = dbQuery.eq('source', source)
    }

    if (inWild && ['Yes', 'No', 'Unknown'].includes(inWild)) {
      dbQuery = dbQuery.eq('in_wild', inWild)
    }

    if (tagId) {
      const tagIdNum = parseInt(tagId)
      // Validate tagId is a positive integer
      if (!isNaN(tagIdNum) && tagIdNum > 0 && tagIdNum <= Number.MAX_SAFE_INTEGER) {
        dbQuery = dbQuery.contains('article_tags', [{ tag_id: tagIdNum }])
      }
    }

    // Execute with pagination
    const start = (page - 1) * perPage
    const end = start + perPage - 1

    const { data, error, count } = await dbQuery.range(start, end)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / perPage)

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        perPage,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

