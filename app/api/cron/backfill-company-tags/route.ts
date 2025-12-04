import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { extractCompanyNames } from '@/lib/scraper'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes

/**
 * Backfill company tags for existing articles
 * Protected by Authorization header with CRON_SECRET
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

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

    console.log('Starting company tag backfill...')

    // Get all tags to build a map
    const { data: allTags } = await supabaseAdmin
      .from('tags')
      .select('id, name')

    const tagMap = new Map(
      (allTags || []).map((tag: any) => [tag.name.toLowerCase(), tag.id])
    )

    // Get all articles with AI summaries (so we have text to extract from)
    const { data: articles, error: articlesError } = await supabaseAdmin
      .from('articles')
      .select('id, title, original_summary, ai_summary')
      .not('ai_summary', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000) // Process in batches

    if (articlesError || !articles) {
      return NextResponse.json(
        { error: 'Failed to fetch articles', details: articlesError },
        { status: 500 }
      )
    }

    console.log(`Processing ${articles.length} articles...`)

    let processed = 0
    let tagsAdded = 0
    const errors: string[] = []

    for (const article of articles) {
      try {
        const title = (article as any).title
        const summary = (article as any).original_summary || ''
        const aiSummary = (article as any).ai_summary || ''

        // Extract company names
        const companyNames = extractCompanyNames(`${title} ${summary} ${aiSummary}`)

        if (companyNames.length === 0) {
          processed++
          continue
        }

        // Get existing tags for this article
        const { data: existingTags } = await supabaseAdmin
          .from('article_tags')
          .select('tag_id')
          .eq('article_id', (article as any).id)

        const existingTagIds = new Set(
          (existingTags || []).map((et: any) => et.tag_id)
        )

        // Process each company name
        const tagsToAdd: number[] = []
        for (const companyName of companyNames) {
          let tagId = tagMap.get(companyName.toLowerCase())

          // Create tag if it doesn't exist
          if (!tagId) {
            const { data: newTag, error: tagError } = await supabaseAdmin
              .from('tags')
              .insert({ name: companyName } as any)
              .select('id')
              .single()

            if (!tagError && newTag) {
              tagId = (newTag as any).id
              tagMap.set(companyName.toLowerCase(), tagId)
            }
          }

          // Add tag if it exists and isn't already assigned
          if (tagId && !existingTagIds.has(tagId)) {
            tagsToAdd.push(tagId)
          }
        }

        // Insert new tags
        if (tagsToAdd.length > 0) {
          const articleTagsData = tagsToAdd.map((tagId) => ({
            article_id: (article as any).id,
            tag_id: tagId,
          }))

          const { error: tagsError } = await supabaseAdmin
            .from('article_tags')
            .insert(articleTagsData as any)

          if (tagsError) {
            errors.push(`Article ${(article as any).id}: ${tagsError.message}`)
          } else {
            tagsAdded += tagsToAdd.length
          }
        }

        processed++
      } catch (error) {
        errors.push(`Article ${(article as any).id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      tagsAdded,
      errors: errors.length > 0 ? errors.slice(0, 10) : [], // Limit error output
      message: `Processed ${processed} articles, added ${tagsAdded} company tags`,
    })
  } catch (error) {
    console.error('Backfill error:', error)
    return NextResponse.json(
      {
        error: 'Backfill failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

