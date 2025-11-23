// Supabase client for server components and API routes
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!url || !key) {
    // Return a mock client if env vars aren't set
    return {
      from: () => ({
        select: () => ({ data: null, error: null, count: 0 }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as any
  }

  try {
    // Try to use cookies() if available (runtime)
    const cookieStore = cookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (error) {
    // Fallback: create client directly if cookies() fails (build time)
    console.warn('Using direct Supabase client (cookies unavailable)')
    return createClient<Database>(url, key)
  }
}

export const createRouteClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!url || !key) {
    // Return a mock client if env vars aren't set
    return {
      from: () => ({
        select: () => ({ data: null, error: null, count: 0 }),
        insert: () => ({ data: null, error: null }),
        update: () => ({ data: null, error: null }),
        delete: () => ({ data: null, error: null }),
      }),
    } as any
  }

  try {
    // Try to use cookies() if available (runtime)
    const cookieStore = cookies()
    return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  } catch (error) {
    // Fallback: create client directly if cookies() fails (build time)
    console.warn('Using direct Supabase client (cookies unavailable)')
    return createClient<Database>(url, key)
  }
}
