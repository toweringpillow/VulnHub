import { supabaseAdmin } from './supabase/admin'
import { sendAlert } from './alerts'
import { ScrapeResult } from '@/types'

const STALE_HOURS = parseInt(process.env.ARTICLE_STALE_HOURS || '24', 10)

export interface FeedHealth {
  lastArticleAt: string | null
  articlesLast24h: number
  hoursSinceLastArticle: number | null
  isStale: boolean
}

export interface ScrapeRunLog {
  scrape_type: 'articles' | 'world_news' | 'health_check'
  articles_processed: number
  articles_added: number
  articles_skipped: number
  errors: string[]
  metadata?: Record<string, unknown>
}

export async function getFeedHealth(): Promise<FeedHealth> {
  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count } = await supabaseAdmin
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', cutoff24h)

  const { data: latestRows } = await supabaseAdmin
    .from('articles')
    .select('created_at')
    .order('created_at', { ascending: false })
    .limit(1)

  const lastArticleAt = latestRows?.[0]?.created_at ?? null
  const hoursSinceLastArticle = lastArticleAt
    ? (Date.now() - new Date(lastArticleAt).getTime()) / (1000 * 60 * 60)
    : null

  return {
    lastArticleAt,
    articlesLast24h: count ?? 0,
    hoursSinceLastArticle,
    isStale: hoursSinceLastArticle === null || hoursSinceLastArticle >= STALE_HOURS,
  }
}

export async function logScrapeRun(log: ScrapeRunLog): Promise<void> {
  const payload = {
    ...log,
    ran_at: new Date().toISOString(),
  }

  console.log('[SCRAPE_RUN]', JSON.stringify(payload))

  const { error } = await supabaseAdmin.from('scrape_runs').insert({
    scrape_type: log.scrape_type,
    articles_processed: log.articles_processed,
    articles_added: log.articles_added,
    articles_skipped: log.articles_skipped,
    errors: log.errors,
    metadata: log.metadata ?? null,
  })

  if (error) {
    // Table may not exist until migration is applied — logs still go to Vercel
    console.warn('[SCRAPE_RUN] Could not persist to scrape_runs:', error.message)
  }
}

async function wasAlertSentRecently(alertKey: string, hours = 12): Promise<boolean> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('scrape_runs')
    .select('id')
    .eq('scrape_type', 'health_check')
    .filter('metadata->>alert_key', 'eq', alertKey)
    .filter('metadata->>alert_sent', 'eq', 'true')
    .gte('ran_at', cutoff)
    .limit(1)

  if (error) {
    return false
  }

  return (data?.length ?? 0) > 0
}

export async function checkAndAlertStaleFeed(trigger: string): Promise<FeedHealth> {
  const health = await getFeedHealth()

  if (!health.isStale) {
    console.log(`[HEALTH] Feed OK — ${health.articlesLast24h} articles in 24h, last ${health.hoursSinceLastArticle?.toFixed(1)}h ago`)
    return health
  }

  const alertKey = 'stale_feed'
  const alreadySent = await wasAlertSentRecently(alertKey)

  if (!alreadySent) {
    const hours = health.hoursSinceLastArticle
      ? Math.round(health.hoursSinceLastArticle)
      : 'unknown'

    await sendAlert({
      title: 'VulnHub: No new articles',
      message: [
        `No articles added in the last ${hours} hours (threshold: ${STALE_HOURS}h).`,
        `Trigger: ${trigger}`,
        `Last article: ${health.lastArticleAt ?? 'never'}`,
        `Articles in last 24h: ${health.articlesLast24h}`,
        'Check Vercel logs, OpenAI API key, and GitHub Actions scraper workflow.',
      ].join('\n'),
      severity: 'warning',
    })

    await logScrapeRun({
      scrape_type: 'health_check',
      articles_processed: 0,
      articles_added: 0,
      articles_skipped: 0,
      errors: [],
      metadata: { alert_key: alertKey, alert_sent: true, trigger, health },
    })
  } else {
    console.log('[HEALTH] Stale feed detected but alert already sent recently')
  }

  return health
}

export async function alertScrapeAnomalies(result: ScrapeResult, trigger: string): Promise<void> {
  if (result.errors.length >= 3) {
    const alertKey = 'scrape_errors'
    if (!(await wasAlertSentRecently(alertKey, 6))) {
      await sendAlert({
        title: 'VulnHub: Scraper errors',
        message: [
          `Scraper run (${trigger}) encountered ${result.errors.length} errors.`,
          `Added: ${result.articlesAdded}, Skipped: ${result.articlesSkipped}, Processed: ${result.articlesProcessed}`,
          `Sample errors: ${result.errors.slice(0, 3).join(' | ')}`,
        ].join('\n'),
        severity: 'error',
      })

      await logScrapeRun({
        scrape_type: 'health_check',
        articles_processed: 0,
        articles_added: 0,
        articles_skipped: 0,
        errors: result.errors.slice(0, 10),
        metadata: { alert_key: alertKey, alert_sent: true, trigger },
      })
    }
  }

  if (result.articlesProcessed > 20 && result.articlesAdded === 0) {
    const health = await getFeedHealth()
    if (health.isStale) {
      const alertKey = 'zero_adds_stale'
      if (!(await wasAlertSentRecently(alertKey, 6))) {
        await sendAlert({
          title: 'VulnHub: Scraper ran but added nothing',
          message: [
            `Processed ${result.articlesProcessed} feed items but added 0 articles.`,
            'Possible causes: overly aggressive sponsored filter, AI rejecting all articles, or duplicate detection.',
            `Last article was ${health.hoursSinceLastArticle ? Math.round(health.hoursSinceLastArticle) + 'h' : 'unknown'} ago.`,
          ].join('\n'),
          severity: 'warning',
        })

        await logScrapeRun({
          scrape_type: 'health_check',
          articles_processed: 0,
          articles_added: 0,
          articles_skipped: 0,
          errors: [],
          metadata: { alert_key: alertKey, alert_sent: true, trigger, result },
        })
      }
    }
  }
}

export async function getRecentScrapeStats(hours = 24): Promise<{
  runs: number
  totalAdded: number
  totalErrors: number
  lastRunAt: string | null
}> {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabaseAdmin
    .from('scrape_runs')
    .select('articles_added, errors, ran_at')
    .eq('scrape_type', 'articles')
    .gte('ran_at', cutoff)
    .order('ran_at', { ascending: false })

  if (error || !data) {
    return { runs: 0, totalAdded: 0, totalErrors: 0, lastRunAt: null }
  }

  return {
    runs: data.length,
    totalAdded: data.reduce((sum, row) => sum + (row.articles_added ?? 0), 0),
    totalErrors: data.reduce((sum, row) => sum + ((row.errors as string[])?.length ?? 0), 0),
    lastRunAt: data[0]?.ran_at ?? null,
  }
}
