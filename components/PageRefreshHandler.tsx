'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

/**
 * Component to handle page refresh on paginated pages
 * Redirects to page 1 and scrolls to top if user refreshes on page > 1
 */
export default function PageRefreshHandler() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1')
    
    // If on page > 1, redirect to page 1 and scroll to top
    if (page > 1) {
      router.replace('/')
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [searchParams, router])

  return null
}

