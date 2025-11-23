'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import toast from 'react-hot-toast'

/**
 * Real-time updates component
 * Shows toast notifications when new threats are added
 * Requires Supabase Realtime to be enabled on the articles table
 */
export default function RealTimeUpdates() {
  useEffect(() => {
    try {
      const supabase = createClient()
      
      // Check if client has required methods
      if (!supabase || typeof supabase.channel !== 'function') {
        return
      }

      // Subscribe to new articles via Supabase Realtime
      const channel = supabase
        .channel('articles-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'articles',
          },
          (payload) => {
            const newArticle = payload.new as any
            
            // Show toast notification
            toast.success(
              (t) => (
                <div className="flex flex-col">
                  <span className="font-semibold">New Threat Detected!</span>
                  <span className="text-sm mt-1">{newArticle.title}</span>
                  <button
                    onClick={() => {
                      window.location.href = `/article/${newArticle.id}/${slugify(newArticle.title)}`
                      toast.dismiss(t.id)
                    }}
                    className="text-xs text-primary-500 hover:text-primary-400 mt-2 underline"
                  >
                    View Details →
                  </button>
                </div>
              ),
              {
                duration: 8000,
                position: 'top-right',
                icon: '🛡️',
              }
            )
          }
        )
        .subscribe()

      // Cleanup on unmount
      return () => {
        try {
          supabase.removeChannel(channel)
        } catch (error) {
          // Silently fail on cleanup
        }
      }
    } catch (error) {
      // Silently fail if Supabase client creation fails
      console.error('RealTimeUpdates: Failed to initialize', error)
    }
  }, [])

  return null // This component doesn't render anything visible
}

