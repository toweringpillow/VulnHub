import { createServerClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SearchBar from '@/components/SearchBar'
import ArticleCard from '@/components/ArticleCard'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

export const revalidate = 300 // Revalidate every 5 minutes

async function getArticles(page: number = 1) {
  try {
    // Check if Supabase env vars are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not set')
      return { articles: [], total: 0 }
    }

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
      .order('published_date', { ascending: false })
      .range(start, end)

    if (error) {
      console.error('Error fetching articles:', error)
      return { articles: [], total: 0 }
    }

    return { articles: data || [], total: count || 0 }
  } catch (error) {
    // Handle case where Supabase isn't configured yet or connection fails
    console.error('Error connecting to Supabase:', error)
    return { articles: [], total: 0 }
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  let articles: any[] = []
  let total = 0
  let totalPages = 0
  
  try {
    const page = parseInt(searchParams.page || '1')
    const result = await getArticles(page)
    articles = result.articles
    total = result.total
    totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE)
  } catch (error) {
    console.error('Error in HomePage:', error)
    // Continue with empty state
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <SearchBar />
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-100 mb-2">
            Latest Cybersecurity Threats
          </h2>
          <p className="text-gray-400">
            Real-time threat intelligence from trusted sources, analyzed by AI
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
            <p className="text-xl text-gray-400">
              No threats found. Check back soon!
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The scraper runs every 15 minutes to fetch the latest threats.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            {page > 1 && (
              <a
                href={`/?page=${page - 1}`}
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
                href={`/?page=${page + 1}`}
                className="btn-ghost px-4 py-2"
              >
                Next
              </a>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

