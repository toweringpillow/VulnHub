// Supabase client for server components and API routes
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

export const createRouteClient = () => {
  return createRouteHandlerClient<Database>({ cookies })
}

