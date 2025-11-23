import Link from 'next/link'
import { ArticleWithTags } from '@/types/database'
import { formatRelativeTime, formatAIField, slugify } from '@/lib/utils'
import { ExternalLink, Clock, AlertTriangle } from 'lucide-react'

interface ArticleCardProps {
  article: ArticleWithTags
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const tags = article.article_tags?.map((at) => at.tags) || []

  return (
    <article className="threat-card group">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <Link
            href={`/article/${article.id}/${slugify(article.title)}`}
            className="text-xl font-semibold text-foreground hover:text-primary-500 transition-colors line-clamp-2"
          >
            {article.title}
          </Link>
          {article.source && (
            <p className="text-sm text-muted-foreground mt-1">{article.source}</p>
          )}
        </div>
        
        {article.in_wild === 'Yes' && (
          <div className="flex-shrink-0">
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-destructive/20 text-destructive rounded-full text-xs font-medium border border-destructive/30">
              <AlertTriangle className="w-3 h-3" />
              <span>In the Wild</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Summary */}
      {article.ai_summary ? (
        <div className="space-y-3 mb-4">
          <p className="text-foreground/90 leading-relaxed">
            {article.ai_summary}
          </p>
          
          {/* Meta Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {article.impact && (
              <div>
                <span className="text-muted-foreground font-medium">Impact: </span>
                <span className="text-foreground">{formatAIField(article.impact)}</span>
              </div>
            )}
            {article.remediation && (
              <div>
                <span className="text-muted-foreground font-medium">Remediation: </span>
                <span className="text-foreground">{formatAIField(article.remediation)}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground italic mb-4">
          AI summary not available yet. Check back soon or read the original article.
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.slice(0, 6).map((tag) => (
            <Link
              key={tag.id}
              href={`/search?tag=${tag.id}`}
              className="tag hover:bg-accent-500/30 transition-colors"
            >
              {tag.name}
            </Link>
          ))}
          {tags.length > 6 && (
            <span className="tag">+{tags.length - 6} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-dark-700">
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <time dateTime={article.published_date}>
            {formatRelativeTime(article.published_date)}
          </time>
        </div>

        <a
          href={article.original_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          <span>Read Original</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </article>
  )
}

