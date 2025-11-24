import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatDate, formatAIField, slugify } from '@/lib/utils'
import { Clock, ExternalLink, AlertTriangle, ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import { SITE_NAME, SITE_URL } from '@/lib/constants'
import StructuredData from '@/components/StructuredData'

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
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all threats</span>
          </Link>

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
                  <div className="flex items-center space-x-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg text-sm font-medium border border-destructive/30">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Actively Exploited</span>
                  </div>
                </div>
              )}
            </div>

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

            {/* AI Summary */}
            {article.ai_summary ? (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-100 mb-3">
                    Summary
                  </h2>
                  <p className="text-gray-200 text-lg leading-relaxed">
                    {article.ai_summary}
                  </p>
                </div>

                {/* Detailed Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">
                      Impact
                    </h3>
                    <p className="text-gray-300">
                      {article.impact ? formatAIField(article.impact) : 'N/A'}
                    </p>
                  </div>

                  {article.in_wild && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">
                        In the Wild
                      </h3>
                      <p className="text-gray-300">
                        {article.in_wild}
                      </p>
                    </div>
                  )}

                  {article.age && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">
                        Timeline
                      </h3>
                      <p className="text-gray-300">
                        {article.age}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-100 mb-2">
                      Remediation
                    </h3>
                    <p className="text-gray-300">
                      {article.remediation ? formatAIField(article.remediation) : 'N/A'}
                    </p>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}

