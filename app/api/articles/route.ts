import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/lib/constants'

/**
 * GET /api/articles
 * Fetch articles with pagination and optional filters
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const perPage = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get('perPage') || String(DEFAULT_PAGE_SIZE)))
    )
    const query = searchParams.get('q')
    const tagId = searchParams.get('tag')
    const source = searchParams.get('source')
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
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,ai_summary.ilike.%${query}%`)
    }

    if (source) {
      dbQuery = dbQuery.eq('source', source)
    }

    if (inWild && ['Yes', 'No', 'Unknown'].includes(inWild)) {
      dbQuery = dbQuery.eq('in_wild', inWild)
    }

    if (tagId) {
      const tagIdNum = parseInt(tagId)
      if (!isNaN(tagIdNum)) {
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

