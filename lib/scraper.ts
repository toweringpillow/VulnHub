// RSS Feed scraper for cybersecurity threats
import Parser from 'rss-parser'
import { supabaseAdmin } from './supabase/admin'
import { analyzeArticle } from './openai'
import { generateContentHash, stripHtml } from './utils'
import {
  ARTICLE_FEEDS,
  MAX_ARTICLES_PER_RUN,
  ARTICLE_CUTOFF_DAYS,
  DUPLICATE_CHECK_HOURS,
  PREDEFINED_TAGS,
} from './constants'
import { ScrapedArticle, ScrapeResult } from '@/types'

const parser = new Parser({
  customFields: {
    item: [['pubDate', 'published'], ['description', 'summary']],
  },
})

/**
 * Scrape articles from all RSS feeds
 */
export async function scrapeArticles(): Promise<ScrapeResult> {
  const result: ScrapeResult = {
    articlesProcessed: 0,
    articlesAdded: 0,
    articlesSkipped: 0,
    errors: [],
  }

  try {
    // Calculate cutoff dates
    const now = new Date()
    const articleCutoff = new Date(now.getTime() - ARTICLE_CUTOFF_DAYS * 24 * 60 * 60 * 1000)
    const duplicateCheckCutoff = new Date(
      now.getTime() - DUPLICATE_CHECK_HOURS * 60 * 60 * 1000
    )

    // Get existing links and hashes to avoid duplicates
    const { data: existingArticles } = await supabaseAdmin
      .from('articles')
      .select('original_link, content_hash')
      .gte('created_at', articleCutoff.toISOString())

    const existingLinks = new Set(
      existingArticles?.map((a: any) => a.original_link) || []
    )
    const existingHashes = new Set(
      existingArticles
        ?.filter((a: any) => a.content_hash)
        .map((a: any) => a.content_hash!) || []
    )

    // Get all tags for matching
    const { data: tags } = await supabaseAdmin
      .from('tags')
      .select('id, name')

    const tagMap = new Map(
      (tags || []).map((tag: any) => [tag.name.toLowerCase(), tag.id])
    )

    // Scrape each feed
    const newArticles: any[] = []

    for (const feed of ARTICLE_FEEDS) {
      if (newArticles.length >= MAX_ARTICLES_PER_RUN) break

      try {
        console.log(`Scraping feed: ${feed.name}`)
        const parsed = await parser.parseURL(feed.url)

        for (const item of parsed.items) {
          result.articlesProcessed++

          const link = item.link?.trim()
          const title = item.title?.trim()

          if (!link || !title) continue

          // Check if already exists
          if (existingLinks.has(link)) {
            result.articlesSkipped++
            continue
          }

          // Parse published date
          const publishedDate = item.pubDate
            ? new Date(item.pubDate)
            : now

          // Skip if too old
          if (publishedDate < articleCutoff) {
            result.articlesSkipped++
            continue
          }

          // Get summary
          const summary = stripHtml(item.contentSnippet || item.summary || '')

          // Check for duplicate content
          const contentHash = await generateContentHash(`${title}|${summary.slice(0, 700)}`)
          if (existingHashes.has(contentHash)) {
            result.articlesSkipped++
            existingLinks.add(link) // Mark as seen
            continue
          }

          // Analyze with AI
          const aiResult = await analyzeArticle(title, link, summary)

          // Match tags
          const articleTags: number[] = []
          const searchText = `${title} ${summary} ${aiResult?.ai_summary || ''}`.toLowerCase()

          // Check predefined tags
          for (const [tagName, tagId] of tagMap.entries()) {
            const regex = new RegExp(`\\b${tagName}\\b`, 'i')
            if (regex.test(searchText)) {
              articleTags.push(tagId)
            }
          }

          // Add suggested tags from AI
          if (aiResult?.suggested_tags) {
            for (const suggestedTag of aiResult.suggested_tags) {
              const tagId = tagMap.get(suggestedTag.toLowerCase())
              if (tagId && !articleTags.includes(tagId)) {
                articleTags.push(tagId)
              }
            }
          }

          // Prepare article for insertion
          const article = {
            title,
            original_link: link,
            source: parsed.title || feed.name,
            published_date: publishedDate.toISOString(),
            created_at: now.toISOString(),
            content_hash: contentHash,
            original_summary: summary,
            ai_summary: aiResult?.ai_summary || null,
            impact: aiResult?.impact || null,
            in_wild: aiResult?.in_wild || null,
            age: aiResult?.age || null,
            remediation: aiResult?.remediation || null,
            ai_retry_count: aiResult ? 0 : 1,
          }

          newArticles.push({ article, tags: articleTags })
          existingLinks.add(link)
          existingHashes.add(contentHash)

          if (newArticles.length >= MAX_ARTICLES_PER_RUN) break
        }
      } catch (error) {
        console.error(`Error scraping feed ${feed.name}:`, error)
        result.errors.push(`${feed.name}: ${error}`)
      }
    }

    // Insert articles into database
    if (newArticles.length > 0) {
      for (const { article, tags: articleTags } of newArticles) {
        try {
          // Insert article
          const { data: insertedArticle, error: articleError } = await supabaseAdmin
            .from('articles')
            .insert(article)
            .select('id')
            .single()

          if (articleError || !insertedArticle) {
            console.error('Error inserting article:', articleError)
            continue
          }

          // Insert article tags
          if (articleTags.length > 0) {
            const articleTagsData = articleTags.map((tagId: any) => ({
              article_id: (insertedArticle as any).id,
              tag_id: tagId,
            }))

            const { error: tagsError } = await supabaseAdmin
              .from('article_tags')
              .insert(articleTagsData)

            if (tagsError) {
              console.error('Error inserting article tags:', tagsError)
            }
          }

          result.articlesAdded++
        } catch (error) {
          console.error('Error inserting article:', error)
          result.errors.push(`Insert failed: ${error}`)
        }
      }
    }

    // Reprocess failed AI articles
    const reprocessed = await reprocessFailedArticles()
    console.log(`Reprocessed ${reprocessed} failed AI articles`)

    console.log('Scraping complete:', result)
    return result
  } catch (error) {
    console.error('Fatal error in scraper:', error)
    result.errors.push(`Fatal: ${error}`)
    return result
  }
}

/**
 * Reprocess articles that failed AI analysis
 */
async function reprocessFailedArticles(limit = 3): Promise<number> {
  const MAX_RETRIES = 2

  const { data: failedArticles } = await supabaseAdmin
    .from('articles')
    .select('id, title, original_summary, ai_retry_count')
    .is('ai_summary', null)
    .not('original_summary', 'is', null)
    .lt('ai_retry_count', MAX_RETRIES)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!failedArticles || failedArticles.length === 0) {
    return 0
  }

  let reprocessed = 0

  for (const article of failedArticles) {
    console.log(`Reprocessing article ${(article as any).id}`)

    const aiResult = await analyzeArticle(
      (article as any).title,
      '',
      (article as any).original_summary || ''
    )

    if (aiResult) {
      await (supabaseAdmin
        .from('articles') as any)
        .update({
          ai_summary: aiResult.ai_summary,
          impact: aiResult.impact,
          in_wild: aiResult.in_wild,
          age: aiResult.age,
          remediation: aiResult.remediation,
          ai_retry_count: (article as any).ai_retry_count + 1,
        })
        .eq('id', (article as any).id)

      reprocessed++
    } else {
      // Increment retry count even if failed
      await (supabaseAdmin
        .from('articles') as any)
        .update({
          ai_retry_count: (article as any).ai_retry_count + 1,
        })
        .eq('id', (article as any).id)
    }
  }

  return reprocessed
}

/**
 * Scrape world news headlines
 */
export async function scrapeWorldNews(): Promise<number> {
  try {
    const headlines: any[] = []

    // For now, we'll use NewsAPI if available
    const newsApiKey = process.env.NEWS_API_KEY

    if (!newsApiKey) {
      console.warn('NEWS_API_KEY not set, skipping world news')
      return 0
    }

    // Fetch top headlines
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&pageSize=25&apiKey=${newsApiKey}`
    )

    if (!response.ok) {
      console.error('NewsAPI error:', response.statusText)
      return 0
    }

    const data = await response.json()

    if (data.articles) {
      for (const article of data.articles) {
        if (article.title && article.url) {
          headlines.push({
            title: article.title,
            link: article.url,
            source: article.source?.name || 'Unknown',
            created_at: new Date().toISOString(),
          })
        }
      }
    }

    // Clear old headlines and insert new ones
    if (headlines.length > 0) {
      await supabaseAdmin.from('world_news').delete().neq('id', 0)
      await supabaseAdmin.from('world_news').insert(headlines as any)
    }

    console.log(`Scraped ${headlines.length} world news headlines`)
    return headlines.length
  } catch (error) {
    console.error('Error scraping world news:', error)
    return 0
  }
}

