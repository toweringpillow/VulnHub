import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatDate, formatAIField, slugify } from '@/lib/utils'
import { Clock, ExternalLink, AlertTriangle, FileText, Newspaper, Home, KeyRound, Info, Shield } from 'lucide-react'
import { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import StructuredData from '@/components/StructuredData'
import { findRelatedArticles, getArticleSourceStats } from '@/lib/articles'

interface PageProps {
  params: { id: string; slug: string }
}

async function getArticle(id: number) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      article_tags (
        tag_id,
        tags (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const article = await getArticle(parseInt(params.id))
  
  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const description = article.ai_summary || article.title

  const articleUrl = `${SITE_URL}/article/${article.id}/${slugify(article.title)}`

  return {
    title: article.title,
    description: description.slice(0, 160),
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: article.title,
      description: description.slice(0, 160),
      type: 'article',
      publishedTime: article.published_date,
      authors: [article.source || SITE_NAME],
      url: articleUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description.slice(0, 160),
    },
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const article = await getArticle(parseInt(params.id))

  if (!article) {
    notFound()
  }

  const tags = article.article_tags?.map((at: any) => at.tags) || []
  
  // Get related articles and source stats
  const relatedArticles = await findRelatedArticles(
    article.id,
    article.title,
    article.ai_summary,
    tags,
    6
  )
  
  const sourceStats = await getArticleSourceStats(article.title, tags)
  
  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.ai_summary || article.original_summary || article.title,
    image: `${SITE_URL}/og-image.png`,
    datePublished: article.published_date,
    dateModified: article.updated_at || article.created_at,
    author: {
      '@type': 'Organization',
      name: article.source || SITE_NAME,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/favicon.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/article/${article.id}/${slugify(article.title)}`,
    },
    keywords: tags.map((tag: any) => tag.name).join(', '),
    articleSection: 'Cybersecurity',
    inLanguage: 'en-US',
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StructuredData data={structuredData} />
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-100 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <Link href="/search" className="hover:text-gray-100 transition-colors">
              Threats
            </Link>
            <span>/</span>
            <span className="text-gray-500">Article</span>
          </nav>

          {/* Article Header */}
          <article className="threat-card">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-3">
                  {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  {article.source && (
                    <span className="font-medium">{article.source}</span>
                  )}
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <time dateTime={article.published_date}>
                      {formatDate(article.published_date, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>
              </div>

              {article.in_wild === 'Yes' && (
                <div className="flex-shrink-0">
                  <div 
                    className="flex items-center space-x-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg text-sm font-medium border border-destructive/30"
                    title="This vulnerability is being actively exploited by attackers in real-world attacks"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    <span>Actively Exploited</span>
                  </div>
                </div>
              )}
            </div>

            {/* Source Stats */}
            {sourceStats.totalSources > 1 && (
              <div className="flex items-center gap-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg mb-6">
                <div className="flex items-center gap-2">
                  <Newspaper className="w-5 h-5 text-primary-400" />
                  <div>
                    <div className="text-lg font-bold text-gray-100">
                      {sourceStats.totalSources} {sourceStats.totalSources === 1 ? 'Source' : 'Sources'}
                    </div>
                    <div className="text-xs text-gray-400">
                      Reporting on this topic
                    </div>
                  </div>
                </div>
                {sourceStats.sources.length > 0 && (
                  <div className="flex-1 flex flex-wrap gap-1 text-xs text-gray-400">
                    {sourceStats.sources.slice(0, 5).map((source, i) => (
                      <span key={i} className="px-2 py-1 bg-dark-700 rounded">
                        {source}
                      </span>
                    ))}
                    {sourceStats.sources.length > 5 && (
                      <span className="px-2 py-1 text-gray-500">
                        +{sourceStats.sources.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag: any) => (
                  <Link
                    key={tag.id}
                    href={`/search?tag=${tag.id}`}
                    className="tag hover:bg-accent-500/30 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}

            {/* AI Summary - More prominent */}
            {article.ai_summary ? (
              <div className="space-y-6">
                <div className="border-l-4 border-primary-500 pl-6 py-2">
                  <h2 className="text-2xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-primary-400" />
                    Overview
                  </h2>
                  <div className="text-gray-100 text-lg leading-relaxed space-y-4">
                    <p>{article.ai_summary}</p>
                  </div>
                </div>

                {/* Key Takeaways */}
                <div className="bg-gradient-to-br from-primary-500/10 to-primary-500/5 border border-primary-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-primary-400" />
                    Key Takeaways
                  </h3>
                  <ul className="space-y-3 text-gray-200">
                    {article.in_wild === 'Yes' && (
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <span><strong>Active Exploitation:</strong> This vulnerability is being actively exploited by attackers. Immediate action is recommended.</span>
                      </li>
                    )}
                    {article.impact && formatAIField(article.impact) !== 'Not specified' && (
                      <li className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Affected Systems:</strong> {formatAIField(article.impact)}</span>
                      </li>
                    )}
                    {article.remediation && formatAIField(article.remediation) !== 'Not specified' && (
                      <li className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Action Required:</strong> {formatAIField(article.remediation).split('.')[0]}.</span>
                      </li>
                    )}
                    {article.age && (
                      <li className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                        <span><strong>Timeline:</strong> {article.age}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Original Summary if different */}
                {article.original_summary && article.original_summary !== article.ai_summary && (
                  <div className="p-4 bg-dark-700/50 rounded-lg border border-dark-600">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">
                      Original Article Summary
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {article.original_summary}
                    </p>
                  </div>
                )}

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary-400" />
                      Impact
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {article.impact ? formatAIField(article.impact) : 'Impact information is not available for this threat. Please refer to the original article for details.'}
                    </p>
                  </div>

                  {article.in_wild && (
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Exploitation Status
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {article.in_wild === 'Yes' 
                          ? 'This vulnerability is confirmed to be actively exploited by attackers in real-world attacks. Organizations should prioritize patching or implementing workarounds immediately.'
                          : article.in_wild === 'No'
                          ? 'No active exploitation has been reported at this time. However, organizations should still apply patches promptly as proof-of-concept code may exist.'
                          : 'The exploitation status is currently unknown. Monitor vendor advisories and security bulletins for updates.'}
                      </p>
                    </div>
                  )}

                  {article.age && (
                    <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-400" />
                        Timeline
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {article.age}
                      </p>
                    </div>
                  )}

                  <div className="bg-dark-800 border border-dark-700 rounded-lg p-5">
                    <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary-400" />
                      Remediation
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {article.remediation ? formatAIField(article.remediation) : 'Remediation steps are not available for this threat. Check the original article or vendor security advisories for patching information and mitigation strategies.'}
                    </p>
                  </div>
                </div>

                {/* Additional Context */}
                <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Additional Information</h3>
                  <div className="space-y-3 text-sm text-gray-300">
                    <p>
                      This threat intelligence is aggregated from trusted cybersecurity sources. For the most 
                      up-to-date information, technical details, and official vendor guidance, please refer to 
                      the original article linked below.
                    </p>
                    {tags.length > 0 && (
                      <p>
                        <strong>Related Topics:</strong> This incident relates to {tags.slice(0, 3).map((t: any) => t.name).join(', ')}
                        {tags.length > 3 && `, and ${tags.length - 3} more`}.
                      </p>
                    )}
                    {sourceStats.totalSources > 1 && (
                      <p>
                        <strong>Multiple Sources:</strong> This threat is being reported by {sourceStats.totalSources} different 
                        security sources, indicating significant concern within the cybersecurity community.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-gray-400 mb-4">
                  Analysis is not available for this article yet.
                </p>
                <p className="text-sm text-gray-500">
                  Check back later or read the original article below.
                </p>
              </div>
            )}

            {/* Original Article Link */}
            <div className="mt-8 pt-6 border-t border-dark-700">
              <a
                href={article.original_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Read Original Article</span>
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">
                Related Coverage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedArticles.map((related: any) => (
                  <Link
                    key={related.id}
                    href={`/article/${related.id}/${slugify(related.title)}`}
                    className="threat-card hover:ring-2 hover:ring-primary-500/50 transition-all"
                  >
                    <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                      {related.title}
                    </h3>
                    {related.source && (
                      <p className="text-sm text-gray-400 mb-2">{related.source}</p>
                    )}
                    {related.ai_summary && (
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {related.ai_summary}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(related.published_date, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

