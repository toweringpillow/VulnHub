import { SPONSORED_KEYWORDS } from './constants'

/**
 * Detect sponsored/promotional content using word-boundary matching
 * to avoid false positives (e.g. "ad" matching inside "thread").
 */
export function isSponsoredContent(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.toLowerCase()

  return SPONSORED_KEYWORDS.some((keyword) => {
    const normalized = keyword.toLowerCase().trim()
    if (!normalized) return false

    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Multi-word phrases or longer keywords: substring match is fine
    if (normalized.includes(' ') || normalized.length >= 8) {
      return text.includes(normalized)
    }

    // Short single words: require word boundaries
    return new RegExp(`\\b${escaped}\\b`, 'i').test(text)
  })
}
