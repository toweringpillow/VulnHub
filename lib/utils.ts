import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const units: [string, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]

  for (const [unit, secondsInUnit] of units) {
    const amount = Math.floor(diffInSeconds / secondsInUnit)
    if (amount >= 1) {
      return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  return dateObj.toLocaleDateString('en-US', defaultOptions)
}

export function truncate(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

/** Sanitize user input used in PostgREST filter expressions */
export function sanitizePostgrestFilter(value: string, maxLength = 100): string {
  return value
    .replace(/[(),.%\\]/g, '')
    .trim()
    .slice(0, maxLength)
}

export async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 10) errors.push('Password must be at least 10 characters long')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number')
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Password must contain at least one special character')
  if (/\s/.test(password)) errors.push('Password must not contain spaces')
  return { isValid: errors.length === 0, errors }
}

export function isValidUsername(username: string): { isValid: boolean; error?: string } {
  if (username.length < 3 || username.length > 20) {
    return { isValid: false, error: 'Username must be 3-20 characters' }
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, - and _' }
  }
  return { isValid: true }
}

export function formatAIField(data: unknown): string {
  if (!data) return 'Not specified'
  try {
    if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) return parsed.join(', ')
      return JSON.stringify(parsed)
    }
    if (Array.isArray(data)) return data.join(', ')
    return String(data)
  } catch {
    return String(data)
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unknown error occurred'
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number) {
  let timeout: NodeJS.Timeout | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
