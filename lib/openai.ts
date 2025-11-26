// OpenAI integration for threat analysis
import OpenAI from 'openai'
import { AIAnalysisResult } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'
const ENABLE_AI = process.env.ENABLE_AI === 'true'

/**
 * Analyze cybersecurity article with OpenAI
 */
export async function analyzeArticle(
  title: string,
  link: string,
  summary: string,
  hasCVE: boolean = false,
  hasInWildTag: boolean = false
): Promise<AIAnalysisResult | null> {
  if (!ENABLE_AI || !process.env.OPENAI_API_KEY) {
    console.warn('AI analysis disabled or API key missing')
    return null
  }

  try {
    // Clean and truncate summary if needed
    const cleanedSummary = summary.replace(/<[^>]*>/g, '').slice(0, 7000)

    // Detect CVE in title/summary if not already detected
    const cvePattern = /CVE-\d{4}-\d+/i
    const hasCVEDetected = hasCVE || cvePattern.test(title) || cvePattern.test(cleanedSummary)

    // Build enhanced prompt for critical vulnerabilities
    const criticalContext = (hasCVEDetected || hasInWildTag) 
      ? `\n\n**CRITICAL: This article mentions a CVE (${hasCVEDetected ? 'YES' : 'NO'}) or is tagged as "In the Wild" (${hasInWildTag ? 'YES' : 'NO'}). 
You MUST provide detailed Impact and Remediation information. 
- For Impact: List ALL affected products, systems, versions, and vendors mentioned. Be comprehensive.
- For Remediation: Extract ALL remediation steps, patches, updates, workarounds, or mitigation strategies mentioned. 
  If patches are available, include patch numbers/versions. If workarounds exist, describe them.
  If the article doesn't explicitly mention remediation, infer reasonable remediation steps based on the vulnerability type.
  DO NOT use "Not specified" unless absolutely no remediation information can be found or inferred.
- Be thorough and professional - cybersecurity professionals rely on this information.` 
      : ''

    const prompt = `Article Title: ${title}
Article Content:
${cleanedSummary}

---
**IMPORTANT: First, determine if this is a legitimate cybersecurity threat article or if it's a sponsored post, advertisement, deal, or promotional content.**

If this article is:
- A product deal, discount, sale, or promotion (e.g., "VPN Deal", "Black Friday", "% off")
- A sponsored post or advertisement
- A product review or software recommendation that's promotional
- Not about an actual cybersecurity threat, vulnerability, or security incident

Then respond with: {"is_sponsored": true, "ai_summary": "This appears to be promotional content, not a cybersecurity threat."}

If this is a legitimate cybersecurity article about threats, vulnerabilities, breaches, or security incidents, analyze it and provide the following information in valid JSON format:
- "is_sponsored": false
- "ai_summary": A brief summary (2-3 sentences) focusing on the core issue, severity, and key implications.
- "impact": A string listing the main affected products, vendors, systems, or versions. Be specific and comprehensive. If none can be determined, value should be "Not specified".
- "in_wild": A string indicating if the vulnerability is actively exploited. Answer only "Yes", "No", or "Unknown". Look for phrases like "actively exploited", "in the wild", "active exploitation", "zero-day exploit".
- "age": A string describing the disclosure timeline (e.g., "Newly disclosed", "Disclosed on [date]", "Ongoing since [timeframe]").
- "remediation": A string listing primary remediation steps, patches, updates, workarounds, or mitigation strategies. Include specific patch numbers, versions, or configuration changes if mentioned. If none are mentioned, infer reasonable remediation steps based on the vulnerability type. Only use "Not specified" if absolutely no remediation information can be found or inferred.
- "suggested_tags": A JSON array of 3-5 relevant string keywords that would help categorize this threat.${criticalContext}`

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 600,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      console.error('OpenAI returned empty response')
      return null
    }

    // Parse JSON response
    const parsed = JSON.parse(content) as AIAnalysisResult

    // Check if article is sponsored/promotional
    if (parsed.is_sponsored === true) {
      console.log('OpenAI detected sponsored/promotional content')
      return null // Return null to skip this article
    }

    // Validate required fields
    if (!parsed.ai_summary || !parsed.ai_summary.trim()) {
      console.error('OpenAI response missing ai_summary')
      return null
    }

    // Normalize in_wild field
    if (parsed.in_wild && !['Yes', 'No', 'Unknown'].includes(parsed.in_wild)) {
      parsed.in_wild = 'Unknown'
    }

    return parsed
  } catch (error) {
    console.error('OpenAI analysis failed:', error)
    return null
  }
}

/**
 * Retry failed AI analysis for an article
 */
export async function retryFailedAnalysis(
  articleId: number,
  title: string,
  originalSummary: string
): Promise<AIAnalysisResult | null> {
  console.log(`Retrying AI analysis for article ${articleId}`)
  return analyzeArticle(title, '', originalSummary)
}

