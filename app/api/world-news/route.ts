import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from('world_news')
      .select('id, title, link, source, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error fetching world news:', error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in world news API:', error)
    return NextResponse.json([], { status: 200 })
  }
}

