import Link from 'next/link'
import { ArticleWithTags } from '@/types/database'
import { formatRelativeTime, formatAIField, slugify } from '@/lib/utils'
import { ExternalLink, Clock, AlertTriangle } from 'lucide-react'

interface ArticleCardProps {
  article: ArticleWithTags
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const tags = article.article_tags?.map((at) => at.tags) || []

  // Check if article has CVE
  const hasCVE = /CVE-\d{4}-\d+/i.test(article.title)
  const isCritical = article.in_wild === 'Yes' || hasCVE

  return (
    <article className={`threat-card group ${isCritical ? 'ring-1 ring-destructive/30' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <Link
            href={`/article/${article.id}/${slugify(article.title)}`}
            className="text-2xl md:text-3xl font-bold text-gray-100 hover:text-primary-400 transition-all duration-200 line-clamp-2 group-hover:translate-x-1"
          >
            {article.title}
          </Link>
          {article.source && (
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm text-gray-400 font-medium">{article.source}</p>
              {hasCVE && (
                <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs font-mono border border-primary-500/30">
                  {article.title.match(/CVE-\d{4}-\d+/i)?.[0]}
                </span>
              )}
            </div>
          )}
        </div>
        
        {article.in_wild === 'Yes' && (
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-destructive/30 to-destructive/20 text-destructive rounded-lg text-xs font-semibold border border-destructive/40 shadow-lg shadow-destructive/20 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>In the Wild</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {article.ai_summary ? (
        <div className="space-y-4 mb-5">
          <div className="bg-dark-900/50 rounded-lg p-4 border-l-4 border-primary-500/50">
            <p className="text-gray-100/95 leading-relaxed text-base">
              {article.ai_summary}
            </p>
          </div>
          
          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-dark-900/40 rounded-lg p-3 border border-dark-600">
              <span className="text-gray-400 font-semibold text-xs uppercase tracking-wide">Impact</span>
              <p className="text-gray-100 mt-1.5 text-sm leading-relaxed">
                {article.impact && formatAIField(article.impact) !== 'Not specified' 
                  ? formatAIField(article.impact) 
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-dark-900/40 rounded-lg p-3 border border-dark-600">
              <span className="text-gray-400 font-semibold text-xs uppercase tracking-wide">Remediation</span>
              <p className="text-gray-100 mt-1.5 text-sm leading-relaxed">
                {article.remediation && formatAIField(article.remediation) !== 'Not specified' 
                  ? formatAIField(article.remediation) 
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-dark-900/30 rounded-lg p-4 border border-dark-600 mb-4">
          <p className="text-gray-400 italic text-sm">
            Summary not available yet. Check back soon or read the original article.
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.slice(0, 6).map((tag) => (
            <Link
              key={tag.id}
              href={`/search?tag=${tag.id}`}
              className="tag hover:bg-accent-500/40 hover:scale-105 hover:shadow-md transition-all duration-200"
            >
              {tag.name}
            </Link>
          ))}
          {tags.length > 6 && (
            <span className="tag opacity-60">+{tags.length - 6} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-700/50">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock className="w-4 h-4 text-gray-500" />
          <time dateTime={article.published_date} className="font-medium">
            {formatRelativeTime(article.published_date)}
          </time>
        </div>

        <a
          href={article.original_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg border border-primary-500/30 transition-all duration-200 hover:scale-105"
        >
          <span>Read Original</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </article>
  )
}

