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

    // Only redirect on a hard reload (not client-side navigation).
    const navEntry = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined
    const isReload = navEntry?.type === 'reload'

    if (page > 1 && isReload) {
      router.replace('/')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [searchParams, router])

  return null
}

