// Supabase client for browser/client components
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

// Mock client for when Supabase isn't configured
const mockClient = {
  channel: () => ({
    on: () => ({ subscribe: () => {} }),
  }),
  removeChannel: () => {},
  from: () => ({
    select: () => ({ data: null, error: null }),
  }),
} as any

export const createClient = () => {
  try {
    // Check if env vars are available (NEXT_PUBLIC_ vars are available in browser)
    if (typeof window !== 'undefined') {
      // In browser, try to create client
      const client = createClientComponentClient<Database>()
      return client
    }
    return mockClient
  } catch (_error) {
    // If client creation fails, return mock to prevent crashes
    console.warn('Supabase client creation failed, using mock client')
    return mockClient
  }
}

// Export a default instance
export const supabase = createClient()

