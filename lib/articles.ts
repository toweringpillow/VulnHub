// Article utilities for finding related articles and statistics
import { supabaseAdmin } from './supabase/admin'

/**
 * Find related articles by CVE, company, or content similarity
 */
export async function findRelatedArticles(
  articleId: number,
  title: string,
  aiSummary: string | null,
  tags: Array<{ id: number; name: string }>,
  limit: number = 5
): Promise<any[]> {
  try {
    // Extract CVE numbers from title
    const cvePattern = /CVE-\d{4}-\d+/gi
    const cves = title.match(cvePattern)

    if (cves && cves.length > 0) {
      // Find articles with the same CVE
      const { data: cveArticles } = await supabaseAdmin
        .from('articles')
        .select('id, title, source, published_date, ai_summary')
        .neq('id', articleId)
        .or(cves.map(cve => `title.ilike.%${cve}%`).join(','))
        .order('published_date', { ascending: false })
        .limit(limit)

      if (cveArticles && cveArticles.length > 0) {
        return cveArticles
      }
    }

    // If no CVE match, find articles with same company tags
    const companyTags = tags.filter(tag => 
      ['Microsoft', 'Apple', 'Google', 'Cisco', 'Fortinet', 'Palo Alto', 'VMware', 'Oracle', 'Adobe'].includes(tag.name)
    )

    if (companyTags.length > 0) {
      const tagIds = companyTags.map(tag => tag.id)
      
      const { data: tagArticles } = await supabaseAdmin
        .from('article_tags')
        .select(`
          article:articles!inner(
            id,
            title,
            source,
            published_date,
            ai_summary
          )
        `)
        .in('tag_id', tagIds)
        .neq('article_id', articleId)
        .limit(limit * 2) // Get more to filter

      if (tagArticles && tagArticles.length > 0) {
        // Deduplicate and limit
        const uniqueArticles = Array.from(
          new Map(tagArticles.map((item: any) => [item.article.id, item.article])).values()
        ).slice(0, limit)

        return uniqueArticles
      }
    }

    // Fallback: similar recent articles
    const { data: recentArticles } = await supabaseAdmin
      .from('articles')
      .select('id, title, source, published_date, ai_summary')
      .neq('id', articleId)
      .not('ai_summary', 'is', null)
      .order('published_date', { ascending: false })
      .limit(limit)

    return recentArticles || []
  } catch (error) {
    console.error('Error finding related articles:', error)
    return []
  }
}

/**
 * Get source statistics for related articles
 */
export async function getArticleSourceStats(
  title: string,
  tags: Array<{ id: number; name: string }>
): Promise<{
  totalSources: number
  sources: string[]
  relatedCount: number
}> {
  try {
    // Extract CVE from title
    const cvePattern = /CVE-\d{4}-\d+/gi
    const cves = title.match(cvePattern)

    let relatedArticles: any[] = []

    if (cves && cves.length > 0) {
      // Find all articles covering the same CVE
      const { data } = await supabaseAdmin
        .from('articles')
        .select('source')
        .or(cves.map(cve => `title.ilike.%${cve}%`).join(','))
        .not('source', 'is', null)

      relatedArticles = data || []
    }

    // Get unique sources
    const sources = Array.from(
      new Set(relatedArticles.map((article: any) => article.source).filter(Boolean))
    )

    return {
      totalSources: sources.length,
      sources: sources.slice(0, 10), // Limit to 10 sources for display
      relatedCount: relatedArticles.length,
    }
  } catch (error) {
    console.error('Error getting source stats:', error)
    return {
      totalSources: 1,
      sources: [],
      relatedCount: 1,
    }
  }
}

