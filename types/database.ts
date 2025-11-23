// Database types for VulnHub
// These should match your Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      articles: {
        Row: {
          id: number
          title: string
          original_link: string
          source: string | null
          published_date: string
          created_at: string
          updated_at: string
          ai_summary: string | null
          impact: string | null
          in_wild: 'Yes' | 'No' | 'Unknown' | null
          age: string | null
          remediation: string | null
          content_hash: string | null
          original_summary: string | null
          ai_retry_count: number
        }
        Insert: {
          id?: number
          title: string
          original_link: string
          source?: string | null
          published_date: string
          created_at?: string
          updated_at?: string
          ai_summary?: string | null
          impact?: string | null
          in_wild?: 'Yes' | 'No' | 'Unknown' | null
          age?: string | null
          remediation?: string | null
          content_hash?: string | null
          original_summary?: string | null
          ai_retry_count?: number
        }
        Update: {
          id?: number
          title?: string
          original_link?: string
          source?: string | null
          published_date?: string
          created_at?: string
          updated_at?: string
          ai_summary?: string | null
          impact?: string | null
          in_wild?: 'Yes' | 'No' | 'Unknown' | null
          age?: string | null
          remediation?: string | null
          content_hash?: string | null
          original_summary?: string | null
          ai_retry_count?: number
        }
      }
      article_tags: {
        Row: {
          article_id: number
          tag_id: number
          created_at: string
        }
        Insert: {
          article_id: number
          tag_id: number
          created_at?: string
        }
        Update: {
          article_id?: number
          tag_id?: number
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          user_id: string
          tag_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          tag_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          tag_id?: number
          created_at?: string
        }
      }
      world_news: {
        Row: {
          id: number
          title: string
          link: string
          source: string | null
          created_at: string
        }
        Insert: {
          id?: number
          title: string
          link: string
          source?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          title?: string
          link?: string
          source?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
export type Tag = Database['public']['Tables']['tags']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type WorldNews = Database['public']['Tables']['world_news']['Row']

// Extended types with relationships
export type ArticleWithTags = Article & {
  article_tags: Array<{
    tag_id: number
    tags: Tag
  }>
}

export type ProfileWithSubscriptions = Profile & {
  subscriptions: Array<{
    tag_id: number
    tags: Tag
  }>
}

