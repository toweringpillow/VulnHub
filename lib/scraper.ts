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
  DEDUPLICATION_WINDOW_DAYS,
  SPONSORED_KEYWORDS,
} from './constants'
import { ScrapeResult } from '@/types'
import { Database } from '@/types/database'

const parser = new Parser({
  customFields: {
    item: [['pubDate', 'published'], ['description', 'summary']],
  },
  timeout: 30000, // 30 second timeout for RSS feed requests
})

/**
 * Company name mappings: lowercase pattern -> normalized display name
 */
const COMPANY_MAPPINGS: Map<string, string> = new Map([
  ['microsoft', 'Microsoft'],
  ['msft', 'Microsoft'],
  ['windows', 'Microsoft'],
  ['apple', 'Apple'],
  ['ios', 'Apple'],
  ['macos', 'Apple'],
  ['iphone', 'Apple'],
  ['google', 'Google'],
  ['android', 'Google'],
  ['chrome', 'Google'],
  ['amazon', 'Amazon'],
  ['aws', 'Amazon'],
  ['meta', 'Meta'],
  ['facebook', 'Meta'],
  ['twitter', 'Twitter'],
  ['x.com', 'Twitter'],
  ['linkedin', 'LinkedIn'],
  ['tesla', 'Tesla'],
  ['nvidia', 'NVIDIA'],
  ['intel', 'Intel'],
  ['amd', 'AMD'],
  ['cisco', 'Cisco'],
  ['fortinet', 'Fortinet'],
  ['palo alto', 'Palo Alto'],
  ['paloaltonetworks', 'Palo Alto'],
  ['vmware', 'VMware'],
  ['oracle', 'Oracle'],
  ['adobe', 'Adobe'],
  ['apache', 'Apache'],
  ['nginx', 'Nginx'],
  ['redis', 'Redis'],
  ['mongodb', 'MongoDB'],
  ['mysql', 'MySQL'],
  ['postgresql', 'PostgreSQL'],
  ['postgres', 'PostgreSQL'],
  ['splunk', 'Splunk'],
  ['solarwinds', 'SolarWinds'],
  ['okta', 'Okta'],
  ['crowdstrike', 'CrowdStrike'],
  ['sentinelone', 'SentinelOne'],
  ['trend micro', 'Trend Micro'],
  ['symantec', 'Symantec'],
  ['proofpoint', 'Proofpoint'],
  ['check point', 'Check Point'],
  ['checkpoint', 'Check Point'],
  ['sophos', 'Sophos'],
  ['kaspersky', 'Kaspersky'],
  ['bitdefender', 'Bitdefender'],
  ['malwarebytes', 'Malwarebytes'],
  ['mimecast', 'Mimecast'],
  ['barracuda', 'Barracuda'],
  ['f5', 'F5'],
  ['juniper', 'Juniper'],
  ['arista', 'Arista'],
  ['dell', 'Dell'],
  ['hp', 'HP'],
  ['hewlett packard', 'HP'],
  ['lenovo', 'Lenovo'],
  ['ibm', 'IBM'],
  ['red hat', 'Red Hat'],
  ['redhat', 'Red Hat'],
  ['canonical', 'Canonical'],
  ['ubuntu', 'Canonical'],
  ['suse', 'SUSE'],
  ['debian', 'Debian'],
])

/**
 * Extract company/product names from article text and return normalized names
 */
function extractCompanyNames(text: string): string[] {
  const lowerText = text.toLowerCase()
  const foundCompanies = new Set<string>()
  
  for (const [pattern, normalizedName] of COMPANY_MAPPINGS.entries()) {
    // Create regex pattern - handle multi-word companies
    const regex = new RegExp(`\\b${pattern.replace(/\s+/g, '\\s+')}\\b`, 'i')
    if (regex.test(lowerText)) {
      foundCompanies.add(normalizedName)
    }
  }
  
  return Array.from(foundCompanies)
}

/**
 * Extract breach/vulnerability signature from article
 * Returns a normalized string that identifies the same breach/vulnerability
 */
function extractBreachSignature(title: string, summary: string, aiSummary?: string | null): string {
  const text = `${title} ${summary} ${aiSummary || ''}`.toLowerCase()
  
  // Extract CVE numbers (strongest identifier)
  const cvePattern = /cve-\d{4}-\d+/gi
  const cves = [...text.matchAll(cvePattern)].map(m => m[0].toUpperCase())
  
  // Extract company/organization names (common patterns)
  const companyPatterns = [
    /\b(microsoft|msft|windows)\b/gi,
    /\b(apple|ios|macos|iphone)\b/gi,
    /\b(google|android|chrome)\b/gi,
    /\b(amazon|aws)\b/gi,
    /\b(meta|facebook)\b/gi,
    /\b(twitter|x\.com)\b/gi,
    /\b(linkedin)\b/gi,
    /\b(tesla)\b/gi,
    /\b(nvidia)\b/gi,
    /\b(intel)\b/gi,
    /\b(amd)\b/gi,
    /\b(cisco)\b/gi,
    /\b(fortinet)\b/gi,
    /\b(palo alto)\b/gi,
    /\b(vmware)\b/gi,
    /\b(oracle)\b/gi,
    /\b(adobe)\b/gi,
    /\b(apache)\b/gi,
    /\b(nginx)\b/gi,
    /\b(redis)\b/gi,
    /\b(mongodb)\b/gi,
    /\b(mysql)\b/gi,
    /\b(postgresql|postgres)\b/gi,
  ]
  
  const companies: string[] = []
  for (const pattern of companyPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const company = match[0].toLowerCase()
      if (!companies.includes(company)) {
        companies.push(company)
      }
    }
  }
  
  // Extract key breach/vulnerability terms
  const breachTerms: string[] = []
  const breachPatterns = [
    /\b(data breach|breach)\b/gi,
    /\b(ransomware|ransom)\b/gi,
    /\b(phishing)\b/gi,
    /\b(zero.?day|0day)\b/gi,
    /\b(exploit|exploitation)\b/gi,
    /\b(vulnerability|vuln)\b/gi,
    /\b(patch|update|fix)\b/gi,
  ]
  
  for (const pattern of breachPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      const term = match[0].toLowerCase()
      if (!breachTerms.includes(term)) {
        breachTerms.push(term)
      }
    }
  }
  
  // Create signature: CVE first (most specific), then companies, then terms
  const signatureParts: string[] = []
  
  if (cves.length > 0) {
    signatureParts.push(`cve:${cves.sort().join(',')}`)
  }
  
  if (companies.length > 0) {
    signatureParts.push(`company:${companies.sort().join(',')}`)
  }
  
  if (breachTerms.length > 0) {
    signatureParts.push(`terms:${breachTerms.sort().join(',')}`)
  }
  
  // If we have a CVE, that's our primary signature
  if (cves.length > 0) {
    return signatureParts[0] // Just the CVE part
  }
  
  // Otherwise, use company + terms combination
  if (signatureParts.length > 0) {
    return signatureParts.join('|')
  }
  
  // Fallback: use normalized title (first 5 words, lowercase, no special chars)
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .slice(0, 5)
    .join(' ')
  
  return `title:${normalizedTitle}`
}

/**
 * Check if two breach signatures are similar enough to be considered duplicates
 */
function areSignaturesSimilar(sig1: string, sig2: string): boolean {
  if (sig1 === sig2) return true
  
  // If both have CVE, they must match exactly
  if (sig1.startsWith('cve:') && sig2.startsWith('cve:')) {
    return sig1 === sig2
  }
  
  // Extract components
  const parts1 = sig1.split('|')
  const parts2 = sig2.split('|')
  
  // Check for CVE matches
  const cve1 = parts1.find(p => p.startsWith('cve:'))
  const cve2 = parts2.find(p => p.startsWith('cve:'))
  if (cve1 && cve2) {
    return cve1 === cve2
  }
  
  // Check company overlap (if both have companies)
  const company1 = parts1.find(p => p.startsWith('company:'))
  const company2 = parts2.find(p => p.startsWith('company:'))
  if (company1 && company2) {
    const companies1 = company1.replace('company:', '').split(',')
    const companies2 = company2.replace('company:', '').split(',')
    const overlap = companies1.filter(c => companies2.includes(c))
    // If significant company overlap, consider similar
    if (overlap.length > 0 && overlap.length >= Math.min(companies1.length, companies2.length) * 0.5) {
      return true
    }
  }
  
  // Check title similarity (for fallback signatures)
  if (sig1.startsWith('title:') && sig2.startsWith('title:')) {
    const title1 = sig1.replace('title:', '')
    const title2 = sig2.replace('title:', '')
    const words1 = new Set(title1.split(' '))
    const words2 = new Set(title2.split(' '))
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    const similarity = intersection.size / union.size
    // If >60% word overlap, consider similar
    return similarity > 0.6
  }
  
  return false
}

/**
 * Check if an article is a duplicate of existing articles within the deduplication window
 * (default: 2 days). This prevents multiple posts about the same breach/vulnerability
 * within a short timeframe, but allows the same CVE/breach to be posted again months later
 * (e.g., for updates, patches, or new developments).
 */
async function isDuplicateWithinWindow(
  title: string,
  summary: string,
  aiSummary: string | null,
  publishedDate: Date
): Promise<boolean> {
  // Calculate the deduplication window (e.g., 2 days back from published date)
  const windowStart = new Date(publishedDate)
  windowStart.setDate(windowStart.getDate() - DEDUPLICATION_WINDOW_DAYS)
  windowStart.setHours(0, 0, 0, 0)
  
  const windowEnd = new Date(publishedDate)
  windowEnd.setHours(23, 59, 59, 999)
  
  // Get all articles within the deduplication window
  const { data: windowArticles } = await supabaseAdmin
    .from('articles')
    .select('title, original_summary, ai_summary, published_date')
    .gte('published_date', windowStart.toISOString())
    .lte('published_date', windowEnd.toISOString())
  
  if (!windowArticles || windowArticles.length === 0) {
    return false
  }
  
  // Generate signature for the new article
  const newSignature = extractBreachSignature(title, summary, aiSummary)
  
  // Check against existing articles within the window
  for (const article of windowArticles as Array<{
    title: string
    original_summary: string | null
    ai_summary: string | null
    published_date: string
  }>) {
    const existingSignature = extractBreachSignature(
      article.title,
      article.original_summary || '',
      article.ai_summary
    )
    
    if (areSignaturesSimilar(newSignature, existingSignature)) {
      const articleDate = new Date(article.published_date).toISOString().split('T')[0]
      const newDate = publishedDate.toISOString().split('T')[0]
      console.log(`Duplicate detected within ${DEDUPLICATION_WINDOW_DAYS}-day window: "${title}" (${newDate}) matches "${article.title}" (${articleDate})`)
      return true
    }
  }
  
  return false
}

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
    // Track signatures of articles processed in this batch (for same-day deduplication)
    // Key: day (YYYY-MM-DD), Value: array of signatures for that day
    const batchSignaturesByDay = new Map<string, Array<{ signature: string; title: string }>>()

    for (const feed of ARTICLE_FEEDS) {
      if (newArticles.length >= MAX_ARTICLES_PER_RUN) break

      try {
        console.log(`Scraping feed: ${feed.name}`)
        
        // Add timeout wrapper to prevent hanging on slow feeds
        const parseWithTimeout = Promise.race([
          parser.parseURL(feed.url),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Feed parsing timeout after 30 seconds')), 30000)
          ),
        ])
        
        const parsed = await parseWithTimeout as Awaited<ReturnType<typeof parser.parseURL>>

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

          // Filter out sponsored posts, deals, and advertisements
          const combinedText = `${title} ${summary}`.toLowerCase()
          const isSponsored = SPONSORED_KEYWORDS.some((keyword) =>
            combinedText.includes(keyword.toLowerCase())
          )

          if (isSponsored) {
            console.log(`Filtered out sponsored/advertisement: ${title}`)
            result.articlesSkipped++
            continue
          }

          // Check for CVE and "In the Wild" indicators before AI analysis
          const cvePattern = /CVE-\d{4}-\d+/i
          const hasCVE = cvePattern.test(title) || cvePattern.test(summary)
          const searchTextLower = `${title} ${summary}`.toLowerCase()
          const hasInWildTag = /in the wild|actively exploited|active exploitation|zero-day exploit/i.test(searchTextLower)

          // Analyze with AI (pass context about CVE/In the Wild)
          const aiResult = await analyzeArticle(title, link, summary, hasCVE, hasInWildTag)

          // Skip if AI detected sponsored content
          if (!aiResult) {
            console.log(`Skipping article (sponsored/promotional detected): ${title}`)
            result.articlesSkipped++
            continue
          }

          // Check for duplicate breach/vulnerability within the deduplication window (e.g., 2 days)
          // First check against database
          const isDuplicateInDB = await isDuplicateWithinWindow(
            title,
            summary,
            aiResult.ai_summary,
            publishedDate
          )
          
          if (isDuplicateInDB) {
            console.log(`Skipping duplicate article within ${DEDUPLICATION_WINDOW_DAYS}-day window (in DB): ${title}`)
            result.articlesSkipped++
            continue
          }
          
          // Also check against articles processed in this batch
          const articleSignature = extractBreachSignature(title, summary, aiResult.ai_summary)
          const articleDate = publishedDate
          
          // Check if we've already processed a similar article within the window in this batch
          let isDuplicateInBatch = false
          
          for (const [dayKey, signatures] of batchSignaturesByDay.entries()) {
            // Parse the day key (YYYY-MM-DD) and compare dates
            const batchDay = new Date(dayKey + 'T00:00:00Z')
            const daysDiff = Math.abs(articleDate.getTime() - batchDay.getTime()) / (1000 * 60 * 60 * 24)
            
            // Only check articles within the deduplication window (including same day)
            if (daysDiff <= DEDUPLICATION_WINDOW_DAYS) {
              for (const batchItem of signatures) {
                if (areSignaturesSimilar(articleSignature, batchItem.signature)) {
                  console.log(`Skipping duplicate article within ${DEDUPLICATION_WINDOW_DAYS}-day window (in batch): "${title}" matches "${batchItem.title}"`)
                  result.articlesSkipped++
                  isDuplicateInBatch = true
                  break
                }
              }
              if (isDuplicateInBatch) break
            }
          }
          
          if (isDuplicateInBatch) {
            continue
          }
          
          // Add to batch signatures for future checks
          const dayKey = publishedDate.toISOString().split('T')[0] // YYYY-MM-DD
          if (!batchSignaturesByDay.has(dayKey)) {
            batchSignaturesByDay.set(dayKey, [])
          }
          batchSignaturesByDay.get(dayKey)!.push({ signature: articleSignature, title })

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

          // Extract and add company/product tags
          const companyNames = extractCompanyNames(`${title} ${summary} ${aiResult?.ai_summary || ''}`)
          for (const companyName of companyNames) {
            let tagId = tagMap.get(companyName.toLowerCase())
            
            // Create tag if it doesn't exist
            if (!tagId) {
              const tagInsert: Database['public']['Tables']['tags']['Insert'] = {
                name: companyName,
              }
              const { data: newTag, error: tagError } = await supabaseAdmin
                .from('tags')
                .insert(tagInsert)
                .select('id')
                .single()
              
              if (!tagError && newTag) {
                tagId = newTag.id
                // Update tagMap for future use in this run
                tagMap.set(companyName.toLowerCase(), tagId)
              }
            }
            
            if (tagId && !articleTags.includes(tagId)) {
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
          // Note: aiResult is guaranteed to be non-null here due to check above
          const article = {
            title,
            original_link: link,
            source: parsed.title || feed.name,
            published_date: publishedDate.toISOString(),
            created_at: now.toISOString(),
            content_hash: contentHash,
            original_summary: summary,
            ai_summary: aiResult.ai_summary || null,
            impact: aiResult.impact || null,
            in_wild: aiResult.in_wild || null,
            age: aiResult.age || null,
            remediation: aiResult.remediation || null,
            ai_retry_count: 0, // Successfully analyzed
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
    
    const title = (article as any).title
    const summary = (article as any).original_summary || ''
    
    // Check for CVE and "In the Wild" indicators
    const cvePattern = /CVE-\d{4}-\d+/i
    const hasCVE = cvePattern.test(title) || cvePattern.test(summary)
    const searchTextLower = `${title} ${summary}`.toLowerCase()
    const hasInWildTag = /in the wild|actively exploited|active exploitation|zero-day exploit/i.test(searchTextLower)

    const aiResult = await analyzeArticle(
      title,
      '',
      summary,
      hasCVE,
      hasInWildTag
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

    // Fetch top headlines - try technology category first, fallback to general
    let response = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=25&apiKey=${newsApiKey}`
    )
    
    // If technology category fails or returns few results, try general news
    if (!response.ok) {
      response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=us&pageSize=25&apiKey=${newsApiKey}`
      )
    }

    if (!response.ok) {
      console.error('NewsAPI error:', response.statusText)
      return 0
    }

    const data = await response.json()

    // Keywords to filter out non-news content
    const filterKeywords = [
      'horoscope',
      'zodiac',
      'astrology',
      'daily horoscope',
      'your horoscope',
      'birth chart',
      'comic strip',
      'comics',
      'crossword',
      'sudoku',
      'puzzle',
      'recipe',
      'cooking',
      'restaurant review',
      'movie review',
      'tv review',
      'celebrity gossip',
      'entertainment news',
      'sports betting',
      'fantasy sports',
      'lottery',
      'powerball',
      'mega millions',
    ]

    if (data.articles) {
      console.log(`Received ${data.articles.length} articles from NewsAPI`)
      for (const article of data.articles) {
        if (!article.title || !article.url) continue

        const titleLower = article.title.toLowerCase()
        const descriptionLower = (article.description || '').toLowerCase()
        const combinedText = `${titleLower} ${descriptionLower}`

        // Skip if contains filter keywords
        const shouldFilter = filterKeywords.some((keyword) =>
          combinedText.includes(keyword)
        )

        if (shouldFilter) {
          console.log(`Filtered out: ${article.title}`)
          continue
        }

        headlines.push({
          title: article.title,
          link: article.url,
          source: article.source?.name || 'Unknown',
          created_at: new Date().toISOString(),
        })
      }
    } else {
      console.warn('No articles in NewsAPI response')
    }

    // Clear old headlines and insert new ones
    if (headlines.length > 0) {
      const { error: deleteError } = await supabaseAdmin.from('world_news').delete().neq('id', 0)
      if (deleteError) {
        console.error('Error deleting old world news:', deleteError)
      }
      
      const { error: insertError } = await supabaseAdmin.from('world_news').insert(headlines as any)
      if (insertError) {
        console.error('Error inserting world news:', insertError)
        return 0
      }
      
      console.log(`Successfully saved ${headlines.length} world news headlines`)
    } else {
      console.warn('No headlines to save after filtering')
    }

    return headlines.length
  } catch (error) {
    console.error('Error scraping world news:', error)
    return 0
  }
}

