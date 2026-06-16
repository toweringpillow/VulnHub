// OpenAI integration for threat analysis
import OpenAI from 'openai'
import { AIAnalysisResult } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'
const ENABLE_AI = process.env.ENABLE_AI === 'true'

export type AnalyzeOutcome =
  | { status: 'success'; data: AIAnalysisResult }
  | { status: 'sponsored' }
  | { status: 'unavailable'; reason: string }

export function isAiEnabled(): boolean {
  return ENABLE_AI && !!process.env.OPENAI_API_KEY
}

/**
 * Analyze cybersecurity article with OpenAI
 */
export async function analyzeArticle(
  title: string,
  link: string,
  summary: string,
  hasCVE: boolean = false,
  hasInWildTag: boolean = false
): Promise<AnalyzeOutcome> {
  if (!isAiEnabled()) {
    return { status: 'unavailable', reason: 'AI disabled or API key missing' }
  }

  try {
    const cleanedSummary = summary.replace(/<[^>]*>/g, '').slice(0, 7000)

    const cvePattern = /CVE-\d{4}-\d+/i
    const hasCVEDetected = hasCVE || cvePattern.test(title) || cvePattern.test(cleanedSummary)

    const criticalContext =
      hasCVEDetected || hasInWildTag
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
- "ai_summary": Write a comprehensive, natural-sounding summary (4-6 sentences, 150-250 words) that explains what happened, who is affected, and why it matters. Write in a clear, direct journalistic style. AVOID these overused phrases: "threat landscape", "delve", "unveil", "shed light", "navigate", "unprecedented", "critical juncture", "paradigm shift", "robust", "leverage", "holistic", "comprehensive analysis", "in the wake of", "underscores", "highlights the importance". Instead, use plain language: "attackers are", "affects", "researchers found", "companies should", "users need to". Be specific about what happened, include concrete details, and explain the real-world implications.
- "impact": A string listing the main affected products, vendors, systems, or versions. Be specific and comprehensive. If none can be determined, value should be "Not specified".
- "in_wild": A string indicating if the vulnerability is actively exploited. Answer only "Yes", "No", or "Unknown". Look for phrases like "actively exploited", "in the wild", "active exploitation", "zero-day exploit".
- "age": A string describing the disclosure timeline (e.g., "Newly disclosed", "Disclosed on [date]", "Ongoing since [timeframe]").
- "remediation": A string listing primary remediation steps, patches, updates, workarounds, or mitigation strategies. Include specific patch numbers, versions, or configuration changes if mentioned. If none are mentioned, infer reasonable remediation steps based on the vulnerability type. Only use "Not specified" if absolutely no remediation information can be found or inferred.
- "suggested_tags": A JSON array of 3-5 relevant string keywords that would help categorize this threat.${criticalContext}`

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { 
          role: 'system', 
          content: 'You are a cybersecurity journalist writing clear, direct summaries of security incidents. Write in a natural, conversational style. Avoid corporate jargon and overused phrases. Be specific and factual.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      console.error('OpenAI returned empty response')
      return { status: 'unavailable', reason: 'empty response' }
    }

    const parsed = JSON.parse(content) as AIAnalysisResult

    if (parsed.is_sponsored === true) {
      console.log('OpenAI detected sponsored/promotional content:', title)
      return { status: 'sponsored' }
    }

    if (!parsed.ai_summary?.trim()) {
      console.error('OpenAI response missing ai_summary')
      return { status: 'unavailable', reason: 'missing ai_summary' }
    }

    if (parsed.in_wild && !['Yes', 'No', 'Unknown'].includes(parsed.in_wild)) {
      parsed.in_wild = 'Unknown'
    }

    return { status: 'success', data: parsed }
  } catch (error) {
    console.error('OpenAI analysis failed:', error)
    return {
      status: 'unavailable',
      reason: error instanceof Error ? error.message : 'unknown error',
    }
  }
}

export async function retryFailedAnalysis(
  articleId: number,
  title: string,
  originalSummary: string
): Promise<AnalyzeOutcome> {
  console.log(`Retrying AI analysis for article ${articleId}`)
  return analyzeArticle(title, '', originalSummary)
}
