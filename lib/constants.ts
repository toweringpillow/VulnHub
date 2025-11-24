// Application constants
import { FeedSource } from '@/types'

// RSS Feed sources
export const ARTICLE_FEEDS: FeedSource[] = [
  {
    url: 'https://feeds.feedburner.com/TheHackersNews?format=xml',
    name: 'The Hacker News',
    type: 'article',
  },
  {
    url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    name: 'CISA Advisories',
    type: 'article',
  },
  {
    url: 'https://www.darkreading.com/rss.xml',
    name: 'Dark Reading',
    type: 'article',
  },
  {
    url: 'https://securelist.com/feed/',
    name: 'Securelist (Kaspersky)',
    type: 'article',
  },
  {
    url: 'https://www.securityweek.com/feed/',
    name: 'SecurityWeek',
    type: 'article',
  },
]

export const HEADLINE_FEEDS: FeedSource[] = [
  {
    url: 'https://feeds.feedburner.com/TheHackersNews?format=xml',
    name: 'The Hacker News',
    type: 'headline',
  },
  {
    url: 'https://www.zdnet.com/topic/security/rss.xml',
    name: 'ZDNet Security',
    type: 'headline',
  },
]

// Scraper configuration
export const MAX_ARTICLES_PER_RUN = parseInt(process.env.MAX_ARTICLES_PER_RUN || '50', 10)
export const MAX_HEADLINES = 25
export const ARTICLE_CUTOFF_DAYS = parseInt(process.env.ARTICLE_CUTOFF_DAYS || '5', 10)
export const DUPLICATE_CHECK_HOURS = 48

// Predefined tags (should match database seed)
export const PREDEFINED_TAGS = [
  'Windows',
  'Linux',
  'macOS',
  'iOS',
  'Android',
  'Ransomware',
  'Phishing',
  'CVE',
  'Zero-day',
  'Microsoft',
  'Apple',
  'Google',
  'Cisco',
  'Fortinet',
  'VMware',
  'Exploit',
  'Vulnerability',
  'Patch',
  'Update',
  'Data Breach',
  'APT',
  'Malware',
  'Trojan',
  'Botnet',
  'DDoS',
  'SQLi',
  'XSS',
  'RCE',
  'Privilege Escalation',
  'Critical',
]

// Pagination
export const DEFAULT_PAGE_SIZE = 15
export const MAX_PAGE_SIZE = 50

// Site metadata
export const SITE_NAME = 'VulnHub'
export const SITE_DESCRIPTION = 'Real-time cybersecurity threat intelligence aggregator'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vulnerabilityhub.com'
export const SITE_LOGO = '/images/logo.png'
export const SITE_FAVICON = '/images/favicon.ico'

// Social/Contact
export const CONTACT_EMAIL = 'support@vulnerabilityhub.com'
export const GITHUB_URL = 'https://github.com/toweringpillow/VulnHub'

// AdSense
export const ADSENSE_CLIENT_ID = 'ca-pub-6273211993737711'

// Rate limiting
export const RATE_LIMIT_REQUESTS = 100
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

