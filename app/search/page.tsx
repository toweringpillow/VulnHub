import { createServerClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchBar from '@/components/SearchBar'
import ArticleCard from '@/components/ArticleCard'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string }
}) {
  const query = searchParams.q || ''
  const page = parseInt(searchParams.page || '1')
  
  const { articles, total } = query 
    ? await searchArticles(query, page)
    : { articles: [], total: 0 }

  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE)

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <SearchBar />
        
        {query ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Search Results for &quot;{query}&quot;
              </h2>
              <p className="text-muted-foreground">
                Found {total} {total === 1 ? 'result' : 'results'}
              </p>
            </div>

            {articles.length > 0 ? (
              <div className="space-y-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  No threats found matching your search.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
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
                
                <span className="text-muted-foreground">
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
            <p className="text-xl text-muted-foreground">
              Enter a search term to find threats.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

