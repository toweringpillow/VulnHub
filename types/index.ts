// Central export for all types
export * from './database'

// UI Component types
export interface NavItem {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

// Feed source configuration
export interface FeedSource {
  url: string
  name: string
  type: 'article' | 'headline'
}

// OpenAI response types
export interface AIAnalysisResult {
  is_sponsored?: boolean // True if article is promotional/sponsored content
  ai_summary: string
  impact: string
  in_wild: 'Yes' | 'No' | 'Unknown'
  age: string
  remediation: string
  suggested_tags: string[]
}

// Scraper types
export interface ScrapedArticle {
  title: string
  link: string
  summary: string
  published_date: Date
  source: string
}

export interface ScrapeResult {
  articlesProcessed: number
  articlesAdded: number
  articlesSkipped: number
  errors: string[]
  newArticleIds?: number[] // IDs of newly added articles (for email alerts)
}

// Search/filter types
export interface SearchFilters {
  query?: string
  tags?: number[]
  source?: string
  inWild?: 'Yes' | 'No' | 'Unknown'
  dateFrom?: Date
  dateTo?: Date
}

// Pagination types
export interface PaginationParams {
  page: number
  perPage: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Auth types
export interface RegisterData {
  email: string
  password: string
  username: string
  display_name?: string
}

export interface LoginData {
  email: string
  password: string
}

