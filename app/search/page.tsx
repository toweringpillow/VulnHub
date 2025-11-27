import { createServerClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchBar from '@/components/SearchBar'
import ArticleCard from '@/components/ArticleCard'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { ArticleWithTags } from '@/types/database'

export const revalidate = 300

async function searchArticles(query: string, page: number = 1) {
  const supabase = createServerClient()
  
  const start = (page - 1) * DEFAULT_PAGE_SIZE
  const end = start + DEFAULT_PAGE_SIZE - 1

  const { data, error, count } = await supabase
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
    `, { count: 'exact' })
    .or(`title.ilike.%${query}%,ai_summary.ilike.%${query}%,impact.ilike.%${query}%`)
    .order('published_date', { ascending: false })
    .range(start, end)

  if (error) {
    console.error('Search error:', error)
    return { articles: [], total: 0 }
  }

  return { articles: data || [], total: count || 0 }
}

async function getArticlesByTag(tagId: number, page: number = 1) {
  const supabase = createServerClient()
  
  const start = (page - 1) * DEFAULT_PAGE_SIZE
  const end = start + DEFAULT_PAGE_SIZE - 1

  // First, get the tag name
  const { data: tagData } = await supabase
    .from('tags')
    .select('name')
    .eq('id', tagId)
    .single()

  // Get articles that have this tag by querying through article_tags
  // We'll get article IDs first, then fetch the full articles
  const { data: articleTagData, error: articleTagError, count } = await supabase
    .from('article_tags')
    .select('article_id', { count: 'exact' })
    .eq('tag_id', tagId)

  if (articleTagError || !articleTagData) {
    console.error('Tag search error:', articleTagError)
    return { articles: [], total: 0, tagName: tagData?.name || null }
  }

  const articleIds = articleTagData.map((at: { article_id: number }) => at.article_id)
  const total = count || 0

  if (articleIds.length === 0) {
    return { articles: [], total: 0, tagName: tagData?.name || null }
  }

  // Get the articles with pagination
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
    .in('id', articleIds)
    .order('published_date', { ascending: false })
    .range(start, end)

  if (error) {
    console.error('Articles fetch error:', error)
    return { articles: [], total: 0, tagName: tagData?.name || null }
  }

  return { 
    articles: (data || []) as ArticleWithTags[], 
    total,
    tagName: tagData?.name || null 
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; page?: string }
}) {
  const query = searchParams.q || ''
  const tagId = searchParams.tag ? parseInt(searchParams.tag) : null
  const page = parseInt(searchParams.page || '1')
  
  let articles: ArticleWithTags[] = []
  let total = 0
  let tagName: string | null = null
  let searchType: 'query' | 'tag' | 'none' = 'none'

  if (tagId && !isNaN(tagId)) {
    // Search by tag
    const result = await getArticlesByTag(tagId, page)
    articles = result.articles
    total = result.total
    tagName = result.tagName
    searchType = 'tag'
  } else if (query) {
    // Text search
    const result = await searchArticles(query, page)
    articles = result.articles
    total = result.total
    searchType = 'query'
  }

  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <SearchBar />
        
        {searchType === 'tag' && tagName ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Articles tagged &quot;{tagName}&quot;
              </h2>
              <p className="text-gray-400">
                Found {total} {total === 1 ? 'article' : 'articles'}
              </p>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-6">
                {articles.map((article: ArticleWithTags) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-400">
                  No articles found with this tag.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try browsing other tags or check back later.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {page > 1 && (
                  <a
                    href={`/search?tag=${tagId}&page=${page - 1}`}
                    className="btn-ghost px-4 py-2"
                  >
                    Previous
                  </a>
                )}
                
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                
                {page < totalPages && (
                  <a
                    href={`/search?tag=${tagId}&page=${page + 1}`}
                    className="btn-ghost px-4 py-2"
                  >
                    Next
                  </a>
                )}
              </div>
            )}
          </>
        ) : searchType === 'query' ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                Search Results for &quot;{query}&quot;
              </h2>
              <p className="text-gray-400">
                Found {total} {total === 1 ? 'result' : 'results'}
              </p>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-6">
                {articles.map((article: ArticleWithTags) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-gray-400">
                  No threats found matching your search.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Try different keywords or check back later.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {page > 1 && (
                  <a
                    href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                    className="btn-ghost px-4 py-2"
                  >
                    Previous
                  </a>
                )}
                
                <span className="text-gray-400">
                  Page {page} of {totalPages}
                </span>
                
                {page < totalPages && (
                  <a
                    href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                    className="btn-ghost px-4 py-2"
                  >
                    Next
                  </a>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-400">
              Enter a search term to find threats.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

