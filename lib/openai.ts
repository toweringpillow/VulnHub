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
  summary: string
): Promise<AIAnalysisResult | null> {
  if (!ENABLE_AI || !process.env.OPENAI_API_KEY) {
    console.warn('AI analysis disabled or API key missing')
    return null
  }

  try {
    // Clean and truncate summary if needed
    const cleanedSummary = summary.replace(/<[^>]*>/g, '').slice(0, 7000)

    const prompt = `Article Title: ${title}
Article Content:
${cleanedSummary}

---
Analyze the provided cybersecurity article content. Based **only** on the text above, extract the following information.
**Important: You must respond in valid JSON format.** Your entire response must be a single JSON object with the following keys:
- "ai_summary": A brief summary (2-3 sentences) focusing on the core issue.
- "impact": A string listing the main affected products or vendors. If none, value should be "Not specified".
- "in_wild": A string indicating if the vulnerability is actively exploited. Answer only "Yes", "No", or "Unknown".
- "age": A string describing the disclosure timeline (e.g., "Newly disclosed").
- "remediation": A string listing primary remediation steps. If none, use "Not specified".
- "suggested_tags": A JSON array of 3-5 relevant string keywords.`

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

