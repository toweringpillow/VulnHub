import { NextResponse } from 'next/server'
import { getTrendingKeywords } from '@/lib/reddit'
import { createServerClient } from '@/lib/supabase/server'

// Cache for 5 minutes
export const revalidate = 300
export const dynamic = 'force-dynamic'
export const maxDuration = 30 // Allow up to 30 seconds for Reddit API calls

/**
 * Extract trending topics from article titles (CVEs, threat names, companies, etc.)
 * This is smarter than just showing generic tags
 */
async function getTrendingTopicsFromArticles(limit: number = 10) {
  try {
    const supabase = createServerClient()
    
    // Get recent articles from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const { data: recentArticles, error: articlesError } = await supabase
      .from('articles')
      .select('title, ai_summary')
      .gte('published_date', sevenDaysAgo.toISOString())
      .order('published_date', { ascending: false })
      .limit(200) // Get enough articles to find trends
    
    if (articlesError || !recentArticles || recentArticles.length === 0) {
      console.log('No recent articles found for trending topics')
      return []
    }
    
    const topicCounts = new Map<string, number>()
    
    // Extract trending topics from titles
    for (const article of recentArticles) {
      const text = `${article.title} ${article.ai_summary || ''}`.toLowerCase()
      
      // Extract CVEs (e.g., CVE-2024-1234)
      const cveMatches = text.match(/cve-\d{4}-\d+/gi)
      if (cveMatches) {
        for (const cve of cveMatches) {
          const cveUpper = cve.toUpperCase()
          topicCounts.set(cveUpper, (topicCounts.get(cveUpper) || 0) + 1)
        }
      }
      
      // Extract ransomware/threat names (common ones)
      const threatPatterns = [
        /\b(lockbit|lockbit 3\.0)\b/gi,
        /\b(blackcat|alphv)\b/gi,
        /\b(conti)\b/gi,
        /\b(revil|sodinokibi)\b/gi,
        /\b(ryuk)\b/gi,
        /\b(wannacry)\b/gi,
        /\b(notpetya)\b/gi,
        /\b(solarwinds)\b/gi,
        /\b(log4j|log4shell)\b/gi,
        /\b(spring4shell)\b/gi,
        /\b(apache struts)\b/gi,
        /\b(eternalblue)\b/gi,
        /\b(bluekeep)\b/gi,
        /\b(zerologon)\b/gi,
        /\b(proxylogon)\b/gi,
        /\b(proxyshell)\b/gi,
        /\b(petitpotam)\b/gi,
        /\b(printnightmare)\b/gi,
        /\b(follina)\b/gi,
        /\b(dirty pipe)\b/gi,
        /\b(dirty cow)\b/gi,
      ]
      
      for (const pattern of threatPatterns) {
        const matches = text.match(pattern)
        if (matches) {
          for (const match of matches) {
            const threat = match.trim()
            // Capitalize first letter of each word
            const threatFormatted = threat.split(' ').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            ).join(' ')
            topicCounts.set(threatFormatted, (topicCounts.get(threatFormatted) || 0) + 1)
          }
        }
      }
      
      // Extract company/product names that are trending (only if mentioned multiple times)
      const companyPatterns = [
        /\b(microsoft (exchange|windows|azure|office|teams))\b/gi,
        /\b(google (chrome|android|workspace))\b/gi,
        /\b(apple (ios|macos|iphone))\b/gi,
        /\b(apache (log4j|struts|kafka))\b/gi,
        /\b(cisco (ios|asa|firepower))\b/gi,
        /\b(fortinet (fortios|fortigate))\b/gi,
        /\b(palo alto (pan-os|firewall))\b/gi,
        /\b(vmware (vcenter|esxi))\b/gi,
        /\b(oracle (weblogic|database))\b/gi,
        /\b(adobe (acrobat|reader|photoshop))\b/gi,
      ]
      
      for (const pattern of companyPatterns) {
        const matches = text.match(pattern)
        if (matches) {
          for (const match of matches) {
            const product = match.trim()
            const productFormatted = product.split(' ').map(w => 
              w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            ).join(' ')
            topicCounts.set(productFormatted, (topicCounts.get(productFormatted) || 0) + 1)
          }
        }
      }
    }
    
    // Filter out topics that only appear once (not trending)
    // And prioritize CVEs and specific threats over generic terms
    const trending = Array.from(topicCounts.entries())
      .filter(([topic, count]) => count >= 2) // Only show if mentioned in 2+ articles
      .map(([topic, count]) => ({
        keyword: topic,
        score: count,
        count: count,
      }))
      .sort((a, b) => {
        // Prioritize CVEs and specific threats
        const aIsCVE = /^CVE-/.test(a.keyword)
        const bIsCVE = /^CVE-/.test(b.keyword)
        if (aIsCVE && !bIsCVE) return -1
        if (!aIsCVE && bIsCVE) return 1
        // Then sort by count
        return b.count - a.count
      })
      .slice(0, limit)
    
    return trending
  } catch (error) {
    console.error('Error in getTrendingTopicsFromArticles:', error)
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
    
    // If Reddit returns no results, fallback to extracting topics from articles
    if (trending.length === 0) {
      console.log('Reddit returned no results, falling back to article topics...')
      const topicsStartTime = Date.now()
      const articleTrending = await getTrendingTopicsFromArticles(15)
      const topicsDuration = Date.now() - topicsStartTime
      
      console.log(`Found ${articleTrending.length} trending topics from articles in ${topicsDuration}ms`)
      
      if (articleTrending.length > 0) {
        console.log('Top article topics:', articleTrending.slice(0, 5).map(t => t.keyword).join(', '))
      }
      
      return NextResponse.json({
        success: true,
        data: articleTrending,
        count: articleTrending.length,
        source: 'articles',
        timestamp: new Date().toISOString(),
        duration: `${topicsDuration}ms`,
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
    
    // Try article topics fallback even on error
    try {
      console.log('Attempting article topics fallback after error...')
      const articleTrending = await getTrendingTopicsFromArticles(15)
      if (articleTrending.length > 0) {
        return NextResponse.json({
          success: true,
          data: articleTrending,
          count: articleTrending.length,
          source: 'articles',
          timestamp: new Date().toISOString(),
        })
      }
    } catch (fallbackError) {
      console.error('Article topics fallback also failed:', fallbackError)
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

