// Supabase client for browser/client components
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export const createClient = () => {
  try {
    return createClientComponentClient<Database>()
  } catch (error) {
    // Fallback: create client directly if auth helper fails
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      // Return a mock client that won't crash
      return {
        channel: () => ({
          on: () => ({ subscribe: () => {} }),
        }),
        removeChannel: () => {},
      } as any
    }
    
    return createSupabaseClient<Database>(url, key)
  }
}

// Export a default instance (lazy initialization)
let supabaseInstance: ReturnType<typeof createClient> | null = null
export const supabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient()
  }
  return supabaseInstance
}

