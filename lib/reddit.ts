// Reddit monitoring service for trending cybersecurity keywords
interface RedditPost {
  title: string
  selftext: string
  score: number
  num_comments: number
  created_utc: number
  subreddit: string
  permalink: string
  url: string
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost
    }>
  }
}

// Cybersecurity-related subreddits to monitor
export const CYBERSECURITY_SUBREDDITS = [
  'cybersecurity',
  'netsec',
  'SecurityCareerAdvice',
  'malware',
  'hacking',
  'privacy',
  'networking',
  'sysadmin',
  'AskNetsec',
  'computerforensics',
  'ReverseEngineering',
  'blackhat',
  'opsec',
  'security',
  'cyber',
  'ITCareerQuestions',
  'homelab',
  'pwned',
  'cissp',
  'CompTIA',
]

// Common cybersecurity keywords to track
export const CYBERSECURITY_KEYWORDS = [
  'ransomware',
  'phishing',
  'malware',
  'vulnerability',
  'exploit',
  'breach',
  'CVE',
  'zero-day',
  'APT',
  'DDoS',
  'SQL injection',
  'XSS',
  'data breach',
  'cyber attack',
  'threat',
  'security',
  'hack',
  'leak',
  'pwned',
  'compromised',
  'backdoor',
  'trojan',
  'botnet',
  'crypto',
  'encryption',
  'firewall',
  'intrusion',
  'penetration',
  'pentest',
  'bug bounty',
]

/**
 * Fetch hot posts from a subreddit
 */
async function fetchSubredditPosts(
  subreddit: string,
  limit: number = 25
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`
    
    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VulnHub/1.0 (Cybersecurity News Aggregator)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Failed to fetch from r/${subreddit}: ${response.status} ${response.statusText}`)
      return []
    }

    const data: RedditResponse = await response.json()
    
    if (!data?.data?.children) {
      console.warn(`Invalid response from r/${subreddit}`)
      return []
    }
    
    return data.data.children.map((child) => child.data)
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`Timeout fetching r/${subreddit}`)
    } else {
      console.error(`Error fetching r/${subreddit}:`, error)
    }
    return []
  }
}

/**
 * Extract keywords from text
 */
function extractKeywords(text: string): string[] {
  const lowerText = text.toLowerCase()
  const foundKeywords: string[] = []

  for (const keyword of CYBERSECURITY_KEYWORDS) {
    const keywordLower = keyword.toLowerCase()
    // Check for exact word match (with word boundaries)
    const regex = new RegExp(`\\b${keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    if (regex.test(lowerText)) {
      foundKeywords.push(keyword)
    }
  }

  return foundKeywords
}

/**
 * Analyze posts and count keyword occurrences
 */
function analyzePosts(posts: RedditPost[]): Map<string, number> {
  const keywordCounts = new Map<string, number>()

  for (const post of posts) {
    const text = `${post.title} ${post.selftext}`.toLowerCase()
    const keywords = extractKeywords(text)

    for (const keyword of keywords) {
      const currentCount = keywordCounts.get(keyword) || 0
      // Weight by score and comments to prioritize trending posts
      const weight = 1 + Math.log10(post.score + 1) + Math.log10(post.num_comments + 1)
      keywordCounts.set(keyword, currentCount + weight)
    }
  }

  return keywordCounts
}

/**
 * Fetch trending keywords from Reddit
 */
export async function getTrendingKeywords(
  subreddits: string[] = CYBERSECURITY_SUBREDDITS,
  limit: number = 10
): Promise<Array<{ keyword: string; score: number; count: number }>> {
  try {
    // Fetch posts from multiple subreddits in parallel (limit to 5 to avoid rate limits)
    const subredditsToFetch = subreddits.slice(0, 5)
    const postPromises = subredditsToFetch.map((subreddit) =>
      fetchSubredditPosts(subreddit, 25)
    )

    const postArrays = await Promise.allSettled(postPromises)
    const allPosts = postArrays
      .filter((result) => result.status === 'fulfilled')
      .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))

    if (allPosts.length === 0) {
      console.warn('No posts fetched from Reddit')
      return []
    }

    // Analyze posts for keywords
    const keywordCounts = analyzePosts(allPosts)

    if (keywordCounts.size === 0) {
      console.warn('No keywords found in posts')
      return []
    }

    // Convert to array and sort by score
    const trending = Array.from(keywordCounts.entries())
      .map(([keyword, score]) => ({
        keyword,
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        count: Math.round(score), // Approximate count
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return trending
  } catch (error) {
    console.error('Error getting trending keywords:', error)
    return []
  }
}

/**
 * Get recent posts mentioning a specific keyword
 */
export async function getPostsByKeyword(
  keyword: string,
  subreddits: string[] = CYBERSECURITY_SUBREDDITS,
  limit: number = 5
): Promise<RedditPost[]> {
  try {
    const postPromises = subreddits.slice(0, 5).map((subreddit) =>
      fetchSubredditPosts(subreddit, 25)
    )

    const postArrays = await Promise.all(postPromises)
    const allPosts = postArrays.flat()

    const keywordLower = keyword.toLowerCase()
    const matchingPosts = allPosts
      .filter((post) => {
        const text = `${post.title} ${post.selftext}`.toLowerCase()
        return text.includes(keywordLower)
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    return matchingPosts
  } catch (error) {
    console.error('Error getting posts by keyword:', error)
    return []
  }
}

