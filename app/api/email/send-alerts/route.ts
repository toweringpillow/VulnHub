import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { sendSubscriptionAlert } from '@/lib/email'

/**
 * POST /api/email/send-alerts
 * Send subscription alerts for new articles
 * This should be called after new articles are added (via cron job)
 * 
 * Query params:
 * - secret: CRON_SECRET for authentication
 * - articleIds: Comma-separated list of article IDs to check (optional, checks recent if not provided)
 */
export async function POST(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || secret !== cronSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if email is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured', skipped: true },
        { status: 200 }
      )
    }

    // Get article IDs from query params or fetch recent articles
    const articleIdsParam = searchParams.get('articleIds')
    let articleIds: number[] = []

    if (articleIdsParam) {
      articleIds = articleIdsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    } else {
      // Get articles from last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { data: recentArticles } = await supabaseAdmin
        .from('articles')
        .select('id')
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!recentArticles || recentArticles.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No new articles found',
          alertsSent: 0,
        })
      }

      articleIds = (recentArticles as Array<{ id: number }>).map(a => a.id)
    }

    if (articleIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No articles to process',
        alertsSent: 0,
      })
    }

    // Get all subscriptions with user and tag info
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        user_id,
        tag_id,
        tags (
          id,
          name
        ),
        profiles:user_id (
          id,
          display_name
        )
      `)

    if (subError) {
      console.error('Error fetching subscriptions:', subError)
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found',
        alertsSent: 0,
      })
    }

    // Get articles with their tags
    const { data: articles, error: articlesError } = await supabaseAdmin
      .from('articles')
      .select(`
        id,
        title,
        ai_summary,
        source,
        published_date,
        article_tags (
          tag_id,
          tags (
            id,
            name
          )
        )
      `)
      .in('id', articleIds)

    if (articlesError) {
      console.error('Error fetching articles:', articlesError)
      return NextResponse.json(
        { error: 'Failed to fetch articles' },
        { status: 500 }
      )
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No articles found',
        alertsSent: 0,
      })
    }

    type ArticleWithTags = {
      id: number
      title: string
      ai_summary: string | null
      source: string | null
      published_date: string
      article_tags: Array<{
        tag_id: number
        tags: { id: number; name: string } | null
      }> | null
    }

    const typedArticles = articles as ArticleWithTags[]

    // Group subscriptions by user
    const userSubscriptions = new Map<string, Array<{ tagId: number; tagName: string; displayName: string }>>()

    type SubscriptionWithRelations = {
      user_id: string
      tag_id: number
      tags: { id: number; name: string } | null
      profiles: { id: string; display_name: string | null } | null
    }

    const typedSubscriptions = subscriptions as SubscriptionWithRelations[]

    for (const sub of typedSubscriptions) {
      const userId = sub.user_id
      const tag = sub.tags?.name
      const displayName = sub.profiles?.display_name || 'User'

      if (!tag) continue

      if (!userSubscriptions.has(userId)) {
        userSubscriptions.set(userId, [])
      }

      userSubscriptions.get(userId)!.push({
        tagId: sub.tag_id,
        tagName: tag,
        displayName,
      })
    }

    // Get user emails from auth.users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    const userEmailMap = new Map<string, string>()
    for (const user of users?.users || []) {
      if (user.email) {
        userEmailMap.set(user.id, user.email)
      }
    }

    // For each user, find matching articles and send alert
    let alertsSent = 0
    const errors: string[] = []

    for (const [userId, tags] of userSubscriptions.entries()) {
      const userEmail = userEmailMap.get(userId)
      if (!userEmail) continue

      const subscribedTagIds = new Set(tags.map(t => t.tagId))
      const subscribedTagNames = tags.map(t => ({ name: t.tagName }))
      const displayName = tags[0]?.displayName || 'User'

      // Find articles that match any of the user's subscribed tags
      const matchingArticles = typedArticles.filter(article => {
        const articleTags = article.article_tags || []
        return articleTags.some((at) => {
          const tagId = at.tags?.id || at.tag_id
          return subscribedTagIds.has(tagId)
        })
      })

      if (matchingArticles.length === 0) continue

      // Format articles for email
      const formattedArticles = matchingArticles.map(article => ({
        id: article.id,
        title: article.title,
        ai_summary: article.ai_summary || '',
        source: article.source,
        published_date: article.published_date,
        tags: (article.article_tags || []).map((at) => ({
          name: at.tags?.name || 'Unknown',
        })),
      }))

      // Send email
      const result = await sendSubscriptionAlert(
        userEmail,
        displayName,
        formattedArticles,
        subscribedTagNames
      )

      if (result.success) {
        alertsSent++
      } else {
        errors.push(`Failed to send to ${userEmail}: ${result.error}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${articleIds.length} articles`,
      alertsSent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Error in send-alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}

