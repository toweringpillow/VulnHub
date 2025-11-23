// Supabase client for server components and API routes
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  try {
    return createServerComponentClient<Database>({ cookies })
  } catch (error) {
    console.error('Error creating Supabase server client:', error)
    // Fallback: create client directly if cookies() fails
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured')
    }
    return createClient<Database>(url, key)
  }
}

export const createRouteClient = () => {
  try {
    return createRouteHandlerClient<Database>({ cookies })
  } catch (error) {
    console.error('Error creating Supabase route client:', error)
    // Fallback: create client directly if cookies() fails
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    if (!url || !key) {
      throw new Error('Supabase environment variables not configured')
    }
    return createClient<Database>(url, key)
  }
}
